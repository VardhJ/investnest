"""
SARFAESI Property Scraper
Aggregates bank-seized properties from IBAPI (ASP.NET) and other portals.
Runs via GitHub Actions cron (free) or manually.
"""

import os
import re
import json
import time
import logging
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlencode

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}


class IBAPIParser:
    """Parse properties from IBAPI (Indian Banks' Association portal).
    
    IBAPI is an ASP.NET WebForms site. Property search requires:
    1. GET initial page to extract __VIEWSTATE
    2. POST to /sale_info_home.aspx with ViewState + form data
    3. Parse results table
    """

    BASE_URL = 'https://www.ibapi.in'

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch_properties(self, max_pages=3):
        properties = []
        
        for page in range(1, max_pages + 1):
            try:
                # Step 1: GET the search page to extract ViewState
                resp = self.session.get(f'{self.BASE_URL}/sale_info_home.aspx', timeout=15)
                if resp.status_code != 200:
                    logger.warning(f"IBAPI page returned {resp.status_code}")
                    break

                soup = BeautifulSoup(resp.text, 'lxml')
                
                # Extract ASP.NET hidden fields
                viewstate = self._get_hidden_field(soup, '__VIEWSTATE')
                viewstate_gen = self._get_hidden_field(soup, '__VIEWSTATEGENERATOR')
                event_validation = self._get_hidden_field(soup, '__EVENTVALIDATION')
                
                if not viewstate:
                    logger.warning("No ViewState found - site may have changed")
                    break

                # Step 2: Build POST data for property search (correct field names)
                post_data = {
                    '__VIEWSTATE': viewstate,
                    '__VIEWSTATEGENERATOR': viewstate_gen or 'DB1E4130',
                    '__EVENTVALIDATION': event_validation or '',
                    '__EVENTTARGET': '',
                    '__EVENTARGUMENT': '',
                    'DropDownList_Bank': 'All',
                    'DropDownList_State': 'All',
                    'DropDownList_City': 'All',
                    'DropDownList_Property_Type': 'All',
                    'TextBox_period': '',
                    'TextBox_pin': '',
                    'txt_prop_id': '',
                    'btn_term': 'Search',
                }

                # Step 3: POST to search
                search_resp = self.session.post(
                    f'{self.BASE_URL}/sale_info_home.aspx',
                    data=post_data,
                    timeout=30
                )
                
                if search_resp.status_code != 200:
                    logger.warning(f"IBAPI search returned {search_resp.status_code}")
                    break

                search_soup = BeautifulSoup(search_resp.text, 'lxml')
                
                # Step 4: Parse property table
                props = self._parse_properties(search_soup)
                if not props:
                    logger.info(f"No properties found on page {page}")
                    break
                
                properties.extend(props)
                logger.info(f"Page {page}: found {len(props)} properties")
                
                # Check for next page
                if not self._has_next_page(search_soup):
                    break
                    
                time.sleep(3)  # Be respectful

            except Exception as e:
                logger.error(f"Error on page {page}: {e}")
                break

        return properties

    def _get_hidden_field(self, soup, field_name):
        """Extract ASP.NET hidden field value."""
        field = soup.find('input', {'name': field_name})
        return field['value'] if field and field.get('value') else None

    def _parse_properties(self, soup):
        """Parse property listings from IBAPI results page."""
        properties = []
        
        # IBAPI uses a GridView with class 'gridview' or table
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) < 2:
                continue
            
            # Check if this is the property table (has expected headers)
            header_row = rows[0]
            headers = [th.get_text(strip=True).lower() for th in header_row.find_all(['th', 'td'])]
            
            if not any(kw in ' '.join(headers) for kw in ['property', 'bank', 'price', 'reserve', 'location']):
                continue
            
            for row in rows[1:]:
                cols = row.find_all('td')
                if len(cols) < 4:
                    continue
                
                prop = self._parse_row(cols, headers)
                if prop:
                    properties.append(prop)
        
        return properties

    def _parse_row(self, cols, headers):
        """Parse a single property row."""
        try:
            # Map columns based on headers
            data = {}
            for i, col in enumerate(cols):
                if i < len(headers):
                    data[headers[i]] = col.get_text(strip=True)
            
            # Extract property details
            title = data.get('property description', '') or data.get('property', '') or data.get('description', '')
            if not title:
                title = cols[0].get_text(strip=True) if cols else ''
            
            bank = data.get('bank name', '') or data.get('bank', '') or data.get('lender', '')
            location = data.get('property location', '') or data.get('location', '') or data.get('address', '')
            price_text = data.get('reserve price', '') or data.get('price', '') or data.get('reserve', '')
            reserve_price = self._parse_price(price_text)
            
            if not title or not reserve_price:
                return None
            
            # Extract link
            link = None
            for col in cols:
                a = col.find('a', href=True)
                if a:
                    link = urljoin(self.BASE_URL, a['href'])
                    break
            
            city, state = self._parse_location(location)
            prop_type = self._detect_type(title, location)
            auction_date = self._parse_date(data.get('auction date', '') or data.get('date', ''))
            
            return {
                'title': title[:200],
                'bank': bank or 'Unknown Bank',
                'branch': None,
                'location': location,
                'city': city,
                'state': state,
                'property_type': prop_type,
                'reserve_price': reserve_price,
                'market_value': None,
                'discount': None,
                'auction_date': auction_date,
                'emd': None,
                'description': title,
                'photos': [],
                'source_url': link or f'{self.BASE_URL}/sale_info_home.aspx',
                'status': 'active',
            }
        except Exception as e:
            logger.debug(f"Error parsing row: {e}")
            return None

    def _parse_price(self, text):
        if not text:
            return None
        text = re.sub(r'[₹Rs\.\s,]', '', text)
        if 'lakh' in text.lower() or 'lac' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 100000) if num else None
        if 'crore' in text.lower() or 'cr' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 10000000) if num else None
        num = re.search(r'[\d]+', text)
        if num:
            return int(num.group())
        return None

    def _parse_location(self, location):
        cities = ['Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Chennai',
                  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh',
                  'Kochi', 'Coimbatore', 'Indore', 'Bhopal', 'Nagpur', 'Surat',
                  'Vadodara', 'Visakhapatnam', 'Patna', 'Ranchi', 'Dehradun']
        city = 'Unknown'
        for c in cities:
            if c.lower() in location.lower():
                city = c
                break
        return city, 'Unknown'

    def _detect_type(self, title, location):
        text = (title + ' ' + location).lower()
        if any(w in text for w in ['flat', 'apartment', 'house', 'villa', 'residential', 'bhk']):
            return 'residential'
        if any(w in text for w in ['office', 'shop', 'commercial', 'showroom', 'warehouse']):
            return 'commercial'
        if any(w in text for w in ['factory', 'industrial', 'plant', 'mill']):
            return 'industrial'
        if any(w in text for w in ['plot', 'land', 'agricultural']):
            return 'land'
        if any(w in text for w in ['car', 'vehicle', 'truck', 'bike']):
            return 'vehicle'
        return 'residential'

    def _parse_date(self, text):
        if not text:
            return None
        formats = ['%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%d %b %Y', '%d %B %Y', '%d-%b-%Y']
        for fmt in formats:
            try:
                return datetime.strptime(text.strip(), fmt).isoformat()
            except ValueError:
                continue
        return None

    def _has_next_page(self, soup):
        # Check for "Next" link or page numbers
        next_link = soup.find('a', string=re.compile(r'next|>|>>', re.I))
        return next_link is not None


class BankPortalParser:
    """Generic parser for bank auction portals.
    
    Many banks publish auction notices on their websites.
    This parser handles common patterns.
    """

    def __init__(self, bank_name, base_url, search_path):
        self.bank_name = bank_name
        self.base_url = base_url
        self.search_path = search_path
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch_properties(self):
        properties = []
        try:
            url = f'{self.base_url}{self.search_path}'
            resp = self.session.get(url, timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'lxml')
                # Generic table parsing
                tables = soup.find_all('table')
                for table in tables:
                    rows = table.find_all('tr')
                    if len(rows) < 2:
                        continue
                    for row in rows[1:]:
                        cols = row.find_all('td')
                        if len(cols) < 3:
                            continue
                        prop = self._parse_generic_row(cols, self.bank_name)
                        if prop:
                            properties.append(prop)
            logger.info(f"{self.bank_name}: found {len(properties)} properties")
        except Exception as e:
            logger.error(f"{self.bank_name} error: {e}")
        return properties

    def _parse_generic_row(self, cols, bank):
        try:
            texts = [c.get_text(strip=True) for c in cols]
            title = texts[0] if texts else ''
            location = texts[1] if len(texts) > 1 else ''
            price_text = texts[2] if len(texts) > 2 else ''
            reserve_price = self._parse_price(price_text)
            
            if not title or not reserve_price:
                return None
            
            city, state = self._parse_location(location)
            prop_type = self._detect_type(title, location)
            
            link = None
            for col in cols:
                a = col.find('a', href=True)
                if a:
                    link = urljoin(self.base_url, a['href'])
                    break
            
            return {
                'title': title[:200],
                'bank': bank,
                'branch': None,
                'location': location,
                'city': city,
                'state': state,
                'property_type': prop_type,
                'reserve_price': reserve_price,
                'market_value': None,
                'discount': None,
                'auction_date': None,
                'emd': None,
                'description': title,
                'photos': [],
                'source_url': link or self.base_url,
                'status': 'active',
            }
        except Exception as e:
            logger.debug(f"Error parsing row: {e}")
            return None

    def _parse_price(self, text):
        if not text:
            return None
        text = re.sub(r'[₹Rs\.\s,]', '', text)
        if 'lakh' in text.lower() or 'lac' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 100000) if num else None
        if 'crore' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 10000000) if num else None
        num = re.search(r'[\d]+', text)
        if num:
            return int(num.group())
        return None

    def _parse_location(self, location):
        cities = ['Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Chennai',
                  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh',
                  'Kochi', 'Coimbatore', 'Indore', 'Bhopal', 'Nagpur', 'Surat']
        city = 'Unknown'
        for c in cities:
            if c.lower() in location.lower():
                city = c
                break
        return city, 'Unknown'

    def _detect_type(self, title, location):
        text = (title + ' ' + location).lower()
        if any(w in text for w in ['flat', 'apartment', 'house', 'villa', 'residential', 'bhk']):
            return 'residential'
        if any(w in text for w in ['office', 'shop', 'commercial', 'showroom', 'warehouse']):
            return 'commercial'
        if any(w in text for w in ['factory', 'industrial', 'plant', 'mill']):
            return 'industrial'
        if any(w in text for w in ['plot', 'land', 'agricultural']):
            return 'land'
        return 'residential'


def save_properties(properties):
    """Save properties to Supabase via REST API or JSON file."""
    if not properties:
        logger.info("No properties to save")
        return

    seen = set()
    unique = []
    for p in properties:
        if p['source_url'] not in seen:
            seen.add(p['source_url'])
            unique.append(p)

    logger.info(f"Saving {len(unique)} unique properties")

    if SUPABASE_URL and SUPABASE_KEY:
        try:
            import requests
            headers = {
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation,resolution=merge-duplicates',
            }
            resp = requests.post(
                f'{SUPABASE_URL}/rest/v1/properties',
                headers=headers,
                json=unique,
                timeout=30
            )
            if resp.status_code in (200, 201):
                logger.info(f"Saved {len(resp.json())} properties to Supabase")
            else:
                logger.error(f"Supabase save error ({resp.status_code}): {resp.text[:200]}")
                _save_json(unique)
        except Exception as e:
            logger.error(f"Supabase save error: {e}")
            _save_json(unique)
    else:
        _save_json(unique)


def _save_json(properties):
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'properties.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(properties, f, indent=2, default=str)
    logger.info(f"Saved {len(properties)} properties to {output_path}")


def main():
    logger.info("Starting SARFAESI property scraper...")
    all_properties = []

    # IBAPI (ASP.NET WebForms) - may fail due to anti-scraping
    try:
        ibapi = IBAPIParser()
        props = ibapi.fetch_properties(max_pages=2)
        all_properties.extend(props)
        logger.info(f"IBAPI: {len(props)} properties")
    except Exception as e:
        logger.error(f"IBAPI failed: {e}")
        logger.info("IBAPI scraping failed. Properties can be added manually via /admin page.")

    # Bank portals (generic parser)
    bank_portals = [
        ('SBI', 'https://www.sbi.co.in', '/web/interest-rates/interest-rates'),
    ]
    
    for bank_name, base_url, path in bank_portals:
        try:
            parser = BankPortalParser(bank_name, base_url, path)
            props = parser.fetch_properties()
            all_properties.extend(props)
        except Exception as e:
            logger.error(f"{bank_name} failed: {e}")

    save_properties(all_properties)
    logger.info(f"Total: {len(all_properties)} properties scraped")


if __name__ == '__main__':
    main()