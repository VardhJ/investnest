"""
SARFAESI Property Scraper
Aggregates bank-seized properties from IBAPI (ASP.NET AJAX) portal.
Runs via GitHub Actions cron (free) or manually.
"""

import os
import re
import json
import time
import logging
from datetime import datetime, timedelta
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load .env.local from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_SERVICE_KEY')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}


class IBAPIParser:
    """Parse properties from IBAPI (Indian Banks' Association portal).
    
    IBAPI uses ASP.NET AJAX: POST to Sale_Info_Home.aspx/Button_search_Click
    with JSON body { key_val: [...] }. Response is JSON with data.d as a
    JSON string containing property records.
    """

    BASE_URL = 'https://www.ibapi.in'

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch_properties(self):
        properties = []

        try:
            # Step 1: GET the search page (establishes session)
            resp = self.session.get(f'{self.BASE_URL}/sale_info_home.aspx', timeout=15)
            if resp.status_code != 200:
                logger.warning(f"IBAPI page returned {resp.status_code}")
                return properties

            # Step 2: Call the AJAX search endpoint
            ajax_url = f'{self.BASE_URL}/Sale_Info_Home.aspx/Button_search_Click'

            # Search with no filters (all properties)
            key_val = []

            ajax_headers = {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }

            search_resp = self.session.post(
                ajax_url,
                json={'key_val': key_val},
                headers=ajax_headers,
                timeout=60
            )

            if search_resp.status_code != 200:
                logger.warning(f"IBAPI AJAX returned {search_resp.status_code}")
                logger.debug(f"Response: {search_resp.text[:300]}")
                return properties

            # Parse JSON response
            try:
                data = search_resp.json()
            except Exception as e:
                logger.error(f"IBAPI response not JSON: {e}")
                logger.debug(f"Response: {search_resp.text[:500]}")
                return properties

            result_str = data.get('d', '')
            if not result_str:
                logger.info("IBAPI returned empty result")
                return properties

            if isinstance(result_str, str) and result_str.startswith('error'):
                logger.warning(f"IBAPI error: {result_str}")
                return properties

            try:
                if isinstance(result_str, str):
                    result_data = json.loads(result_str)
                else:
                    result_data = result_str
            except json.JSONDecodeError:
                logger.error(f"Could not parse IBAPI result: {str(result_str)[:200]}")
                return properties

            if not isinstance(result_data, list):
                logger.warning(f"IBAPI result is not a list: {type(result_data)}")
                return properties

            logger.info(f"IBAPI returned {len(result_data)} properties")

            for item in result_data:
                prop = self._parse_item(item)
                if prop:
                    properties.append(prop)

            time.sleep(2)

        except Exception as e:
            logger.error(f"IBAPI failed: {e}")

        return properties

    def _parse_item(self, item):
        try:
            prop_type_raw = item.get('Property', '') or ''
            bank = item.get('Bank Name', '') or ''
            state = item.get('State', '') or ''
            district = item.get('District', '') or ''
            city = item.get('City', '') or ''
            location = f"{city}, {district}, {state}".strip(', ')
            
            # Create a descriptive title
            title = f"{prop_type_raw.title()} Property in {city}, {district}" if city else f"{prop_type_raw.title()} Property"

            price_text = item.get('Reserve Price (Rs)', '') or ''
            reserve_price = self._parse_price(str(price_text))

            if not title or not reserve_price:
                return None

            emd_text = item.get('EMD (Rs)', '') or ''
            emd = self._parse_price(str(emd_text))

            auction_start = item.get('Auction Start Date & Time', '') or ''
            auction_end = item.get('Auction End Date & Time', '') or ''
            emd_date = item.get('EMD Last Date & Time', '') or ''
            # Property ID contains HTML: <a id="btn_view" ...>CORP0020190266</a>
            prop_id_raw = item.get('Property ID', '') or ''
            prop_id = re.sub(r'<[^>]+>', '', str(prop_id_raw)).strip()
            
            city_clean = city if city else self._extract_city(location)

            return {
                'title': title[:200],
                'bank': bank or 'Unknown Bank',
                'branch': None,
                'location': location,
                'city': city_clean or 'Unknown',
                'state': state or 'Unknown',
                'property_type': self._map_property_type(prop_type_raw),
                'reserve_price': reserve_price,
                'market_value': None,
                'discount': None,
                'auction_date': self._parse_date(auction_start),
                'emd': emd,
                'description': title,
                'photos': [],
                'source_url': f"{self.BASE_URL}/sale_info_home.aspx?prop={prop_id}" if prop_id else f'{self.BASE_URL}/sale_info_home.aspx',
                'status': 'active',
            }
        except Exception as e:
            logger.debug(f"Error parsing item: {e}")
            return None

    def _parse_price(self, text):
        if not text:
            return None
        text = str(text).replace(',', '').replace('₹', '').replace('Rs', '').replace('Rs.', '').strip()
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

    def _extract_city(self, location):
        cities = ['Mumbai', 'Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Chennai',
                  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh',
                  'Kochi', 'Coimbatore', 'Indore', 'Bhopal', 'Nagpur', 'Surat',
                  'Vadodara', 'Visakhapatnam', 'Patna', 'Ranchi', 'Dehradun']
        for c in cities:
            if c.lower() in location.lower():
                return c
        return 'Unknown'

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

    def _map_property_type(self, prop_type):
        """Map IBAPI property type to our enum."""
        text = str(prop_type).lower()
        if 'residential' in text or 'flat' in text or 'house' in text or 'apartment' in text:
            return 'residential'
        if 'commercial' in text or 'office' in text or 'shop' in text or 'showroom' in text:
            return 'commercial'
        if 'industrial' in text or 'factory' in text or 'plant' in text or 'warehouse' in text:
            return 'industrial'
        if 'agricultural' in text or 'plot' in text or 'land' in text:
            return 'land'
        if 'vehicle' in text or 'car' in text or 'truck' in text:
            return 'vehicle'
        return 'residential'

    def _parse_date(self, text):
        if not text:
            return None
        formats = ['%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%d %b %Y', '%d %B %Y', '%d-%b-%Y', '%d/%m/%Y %H:%M:%S', '%d-%m-%Y %H:%M:%S', '%d/%m/%Y %H:%M', '%d-%m-%Y %H:%M']
        for fmt in formats:
            try:
                return datetime.strptime(text.strip(), fmt).isoformat()
            except ValueError:
                continue
        return None


def save_properties(properties):
    """Save properties to Supabase via REST API or JSON file."""
    if not properties:
        logger.info("No properties to save")
        return

    seen = set()
    unique = []
    for p in properties:
        # Deduplicate by bank + title + city (not source_url, since all share the same URL)
        key = f"{p.get('bank', '')}|{p.get('title', '')}|{p.get('city', '')}|{p.get('reserve_price', '')}"
        if key not in seen:
            seen.add(key)
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
                timeout=60
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

    # IBAPI (ASP.NET AJAX)
    try:
        ibapi = IBAPIParser()
        props = ibapi.fetch_properties()
        all_properties.extend(props)
        logger.info(f"IBAPI: {len(props)} properties")
    except Exception as e:
        logger.error(f"IBAPI failed: {e}")

    save_properties(all_properties)
    logger.info(f"Total: {len(all_properties)} properties scraped")


if __name__ == '__main__':
    main()