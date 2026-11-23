"""
SARFAESI Property Scraper
Aggregates bank-seized properties from IBAPI and major bank portals.
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

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase REST API (no client library needed)
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}


class IBAPIParser:
    """Parse properties from IBAPI (Indian Banks' Association portal)."""

    BASE_URL = 'https://www.ibapi.in'

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch_properties(self, max_pages=5):
        """Fetch properties from IBAPI. Returns list of property dicts."""
        properties = []
        for page in range(1, max_pages + 1):
            try:
                url = f"{self.BASE_URL}/home/properties?page={page}"
                resp = self.session.get(url, timeout=15)
                if resp.status_code != 200:
                    logger.warning(f"IBAPI page {page} returned {resp.status_code}")
                    break

                soup = BeautifulSoup(resp.text, 'lxml')
                cards = soup.select('.property-card, .listing-card, .auction-item, [class*="property"]')

                if not cards:
                    # Try alternative selectors
                    cards = soup.select('div.row .col-md-4, .card, .listing')

                if not cards:
                    logger.info(f"No more properties found on page {page}")
                    break

                for card in cards:
                    prop = self._parse_card(card)
                    if prop:
                        properties.append(prop)

                logger.info(f"Page {page}: found {len(cards)} cards, {len(properties)} total")
                time.sleep(2)  # Be respectful

            except Exception as e:
                logger.error(f"Error on page {page}: {e}")
                break

        return properties

    def _parse_card(self, card):
        """Parse a single property card."""
        try:
            title = card.select_one('h3, h4, .title, [class*="title"]')
            title = title.get_text(strip=True) if title else None

            bank = card.select_one('.bank, [class*="bank"], [class*="lender"]')
            bank = bank.get_text(strip=True) if bank else None

            location = card.select_one('.location, [class*="location"], [class*="address"]')
            location = location.get_text(strip=True) if location else None

            price = card.select_one('.price, [class*="price"], [class*="reserve"]')
            price_text = price.get_text(strip=True) if price else None
            reserve_price = self._parse_price(price_text)

            auction_date = card.select_one('.date, [class*="date"], [class*="auction"]')
            auction_date = auction_date.get_text(strip=True) if auction_date else None

            link = card.select_one('a[href]')
            source_url = urljoin(self.BASE_URL, link['href']) if link else self.BASE_URL

            if not title or not reserve_price:
                return None

            # Extract city and state from location
            city, state = self._parse_location(location or '')

            # Determine property type
            prop_type = self._detect_type(title, location or '')

            return {
                'title': title,
                'bank': bank or 'Unknown Bank',
                'branch': None,
                'location': location or '',
                'city': city,
                'state': state,
                'property_type': prop_type,
                'reserve_price': reserve_price,
                'market_value': None,
                'discount': None,
                'auction_date': self._parse_date(auction_date),
                'emd': None,
                'description': '',
                'photos': [],
                'source_url': source_url,
            }
        except Exception as e:
            logger.debug(f"Error parsing card: {e}")
            return None

    def _parse_price(self, text):
        """Extract numeric price from text like '₹50,00,000' or '50 Lakh'."""
        if not text:
            return None
        # Remove currency symbols and commas
        text = re.sub(r'[₹Rs\.\s]', '', text)
        # Handle lakh/crore
        if 'lakh' in text.lower() or 'lac' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 100000) if num else None
        if 'crore' in text.lower() or 'cr' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 10000000) if num else None
        # Plain number
        num = re.search(r'[\d,]+', text)
        if num:
            return int(num.group().replace(',', ''))
        return None

    def _parse_location(self, location):
        """Extract city and state from location string."""
        # Common Indian cities
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
        """Detect property type from title/location."""
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
        """Parse date string to ISO format."""
        if not text:
            return None
        formats = ['%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%d %b %Y', '%d %B %Y']
        for fmt in formats:
            try:
                return datetime.strptime(text.strip(), fmt).isoformat()
            except ValueError:
                continue
        return None


class SBIParser:
    """Parse properties from SBI e-Auction portal."""

    BASE_URL = 'https://www.sbi.co.in/web/interest-rates/interest-rates'

    def fetch_properties(self, max_pages=3):
        properties = []
        # SBI e-auction URL
        url = 'https://www.sbieauction.in'
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'lxml')
                # Parse SBI-specific structure
                logger.info(f"SBI portal accessible, status: {resp.status_code}")
            else:
                logger.warning(f"SBI portal returned {resp.status_code}")
        except Exception as e:
            logger.error(f"SBI portal error: {e}")
        return properties


def save_properties(properties):
    """Save properties to Supabase via REST API or JSON file."""
    if not properties:
        logger.info("No properties to save")
        return

    # Deduplicate by source_url
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
    """Fallback: save to JSON file."""
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'properties.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(properties, f, indent=2, default=str)
    logger.info(f"Saved {len(properties)} properties to {output_path}")


def main():
    logger.info("Starting SARFAESI property scraper...")

    all_properties = []

    # IBAPI (most comprehensive)
    ibapi = IBAPIParser()
    props = ibapi.fetch_properties(max_pages=3)
    all_properties.extend(props)
    logger.info(f"IBAPI: {len(props)} properties")

    # SBI
    sbi = SBIParser()
    props = sbi.fetch_properties(max_pages=2)
    all_properties.extend(props)
    logger.info(f"SBI: {len(props)} properties")

    # Save
    save_properties(all_properties)
    logger.info(f"Total: {len(all_properties)} properties scraped")


if __name__ == '__main__':
    main()