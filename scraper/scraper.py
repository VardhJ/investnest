"""
SARFAESI Property Scraper — Enhanced
Aggregates bank-seized properties from IBAPI (ASP.NET AJAX) portal.
Tracks new/removed/changed properties for alerts.
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

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
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

    def fetch_properties(self):
        properties = []

        try:
            resp = self.session.get(f'{self.BASE_URL}/sale_info_home.aspx', timeout=15)
            if resp.status_code != 200:
                logger.warning(f"IBAPI page returned {resp.status_code}")
                return properties

            ajax_url = f'{self.BASE_URL}/Sale_Info_Home.aspx/Button_search_Click'

            search_resp = self.session.post(
                ajax_url,
                json={'key_val': []},
                headers={
                    'Content-Type': 'application/json; charset=utf-8',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout=120
            )

            if search_resp.status_code != 200:
                logger.warning(f"IBAPI AJAX returned {search_resp.status_code}")
                return properties

            data = search_resp.json()
            result_str = data.get('d', '')
            if not result_str:
                logger.info("IBAPI returned empty result")
                return properties

            if isinstance(result_str, str) and result_str.startswith('error'):
                logger.warning(f"IBAPI error: {result_str}")
                return properties

            try:
                result_data = json.loads(result_str) if isinstance(result_str, str) else result_str
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

            title = f"{prop_type_raw.title()} Property in {city}, {district}" if city else f"{prop_type_raw.title()} Property"

            price_text = item.get('Reserve Price (Rs)', '') or ''
            reserve_price = self._parse_price(str(price_text))

            if not title or not reserve_price:
                return None

            emd_text = item.get('EMD (Rs)', '') or ''
            emd = self._parse_price(str(emd_text))

            auction_start = item.get('Auction Start Date & Time', '') or ''
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

    def _map_property_type(self, prop_type):
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


def get_existing_properties():
    """Fetch all existing properties from Supabase."""
    properties = []
    offset = 0
    limit = 1000
    while True:
        resp = requests.get(
            f'{SUPABASE_URL}/rest/v1/properties?select=*&order=created_at.asc',
            headers={
                'apikey': SUPABASE_KEY,
                'Authorization': f'Bearer {SUPABASE_KEY}',
                'Range': f'{offset}-{offset + limit - 1}',
            },
            timeout=30
        )
        if resp.status_code != 200:
            logger.error(f"Failed to fetch existing properties: {resp.status_code}")
            break
        data = resp.json()
        if not data:
            break
        properties.extend(data)
        if len(data) < limit:
            break
        offset += limit
    return properties


def save_properties(properties):
    """Save properties to Supabase via REST API."""
    if not properties:
        logger.info("No properties to save")
        return

    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates',
    }

    # Save in batches of 500
    batch_size = 500
    total_saved = 0
    for i in range(0, len(properties), batch_size):
        batch = properties[i:i + batch_size]
        try:
            resp = requests.post(
                f'{SUPABASE_URL}/rest/v1/properties',
                headers=headers,
                json=batch,
                timeout=60
            )
            if resp.status_code in (200, 201):
                total_saved += len(resp.json())
            else:
                logger.error(f"Supabase save error ({resp.status_code}): {resp.text[:200]}")
        except Exception as e:
            logger.error(f"Supabase save error: {e}")
    
    logger.info(f"Saved {total_saved} properties to Supabase")


def update_property_status(property_id, status):
    """Update a property's status."""
    try:
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
        }
        resp = requests.patch(
            f'{SUPABASE_URL}/rest/v1/properties?id=eq.{property_id}',
            headers=headers,
            json={'status': status, 'updated_at': datetime.now().isoformat()},
            timeout=10
        )
        return resp.status_code in (200, 204)
    except Exception as e:
        logger.error(f"Failed to update property {property_id}: {e}")
        return False


def log_scrape(stats):
    """Log scrape results to scrape_logs table."""
    try:
        headers = {
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
        }
        resp = requests.post(
            f'{SUPABASE_URL}/rest/v1/scrape_logs',
            headers=headers,
            json={
                'scraped_at': datetime.now().isoformat(),
                'total_fetched': stats['total_fetched'],
                'new_properties': stats['new'],
                'updated_properties': stats['updated'],
                'removed_properties': stats['removed'],
                'price_changes': stats['price_changes'],
                'duration_seconds': stats['duration'],
            },
            timeout=10
        )
        if resp.status_code in (200, 201):
            logger.info("Scrape log saved")
        else:
            logger.warning(f"Failed to save scrape log: {resp.status_code}")
    except Exception as e:
        logger.warning(f"Failed to save scrape log: {e}")


def main():
    start_time = datetime.now()
    logger.info("Starting SARFAESI property scraper (enhanced)...")
    all_properties = []

    # Step 1: Fetch from IBAPI
    try:
        ibapi = IBAPIParser()
        props = ibapi.fetch_properties()
        all_properties.extend(props)
        logger.info(f"IBAPI: {len(props)} properties")
    except Exception as e:
        logger.error(f"IBAPI failed: {e}")

    if not all_properties:
        logger.warning("No properties fetched. Exiting.")
        return

    # Step 2: Get existing properties from DB
    logger.info("Fetching existing properties from DB...")
    existing = get_existing_properties()
    logger.info(f"Found {len(existing)} existing properties in DB")

    # Step 3: Build lookup by source_url
    existing_map = {p['source_url']: p for p in existing}
    now = datetime.now().isoformat()

    new_props = []
    updated_props = []
    price_changes = 0

    for prop in all_properties:
        key = prop['source_url']
        if key in existing_map:
            old = existing_map[key]
            # Check for price change
            if old.get('reserve_price') != prop['reserve_price']:
                price_changes += 1
                # Append to price history
                history = old.get('price_history') or []
                history.append({
                    'date': now,
                    'price': prop['reserve_price']
                })
                prop['price_history'] = history
            
            # Update tracking fields
            prop['first_seen_at'] = old.get('first_seen_at', now)
            prop['last_seen_at'] = now
            prop['scrape_count'] = (old.get('scrape_count') or 0) + 1
            prop['id'] = old['id']  # Keep existing ID
            
            # Remove fields that shouldn't be updated
            for field in ['created_at']:
                prop.pop(field, None)
            
            updated_props.append(prop)
        else:
            # New property
            prop['first_seen_at'] = now
            prop['last_seen_at'] = now
            prop['scrape_count'] = 1
            prop['price_history'] = [{'date': now, 'price': prop['reserve_price']}]
            new_props.append(prop)

    # Step 4: Find removed properties (likely sold)
    ibapi_urls = set(p['source_url'] for p in all_properties)
    removed = [p for p in existing if p['source_url'] not in ibapi_urls]
    logger.info(f"Found {len(removed)} removed properties (likely sold)")

    # Mark removed properties as "likely_sold"
    for prop in removed:
        update_property_status(prop['id'], 'likely_sold')

    # Step 5: Save new + updated properties
    to_save = new_props + updated_props
    logger.info(f"Saving {len(to_save)} properties ({len(new_props)} new, {len(updated_props)} updated)")
    save_properties(to_save)

    # Step 6: Log scrape results
    duration = (datetime.now() - start_time).total_seconds()
    stats = {
        'total_fetched': len(all_properties),
        'new': len(new_props),
        'updated': len(updated_props),
        'removed': len(removed),
        'price_changes': price_changes,
        'duration': int(duration),
    }
    log_scrape(stats)

    logger.info(f"Scrape complete in {int(duration)}s:")
    logger.info(f"  New: {len(new_props)}")
    logger.info(f"  Updated: {len(updated_props)}")
    logger.info(f"  Removed (likely sold): {len(removed)}")
    logger.info(f"  Price changes: {price_changes}")


if __name__ == '__main__':
    main()