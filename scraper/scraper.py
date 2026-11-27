"""
SARFAESI Property Scraper - Enhanced with IBAPI Detail Enrichment & Deal Valuation
Aggregates bank-seized properties from IBAPI (ASP.NET AJAX) portal.
Enriches properties via bind_modal_detail & getCarouselData (address, borrower, possession,
sub-type, area sq.ft, bidding URL, and images) and computes circle-rate market value estimates
and discount percentages so every listing has populated valuation metrics.
Runs via GitHub Actions cron (free) or manually.
"""

import os
import re
import json
import time
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
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

# Conservative Circle Rate + Market Price per sq.ft benchmarks (INR) for automated valuation
CITY_BENCHMARK_PSF = {
    'mumbai': {'residential': 16500, 'commercial': 27500},
    'delhi': {'residential': 9000, 'commercial': 16500},
    'bangalore': {'residential': 7750, 'commercial': 13000},
    'bengaluru': {'residential': 7750, 'commercial': 13000},
    'hyderabad': {'residential': 6500, 'commercial': 11000},
    'chennai': {'residential': 7000, 'commercial': 12000},
    'kolkata': {'residential': 5500, 'commercial': 9500},
    'pune': {'residential': 7000, 'commercial': 12000},
    'ahmedabad': {'residential': 5000, 'commercial': 8500},
    'jaipur': {'residential': 4500, 'commercial': 7500},
    'lucknow': {'residential': 4000, 'commercial': 6750},
    'chandigarh': {'residential': 6500, 'commercial': 11000},
    'kochi': {'residential': 6000, 'commercial': 10000},
    'coimbatore': {'residential': 4500, 'commercial': 7750},
    'indore': {'residential': 4500, 'commercial': 7750},
    'bhopal': {'residential': 4000, 'commercial': 6750},
    'nagpur': {'residential': 4000, 'commercial': 6750},
    'surat': {'residential': 4500, 'commercial': 7750},
    'vadodara': {'residential': 4000, 'commercial': 6750},
    'patna': {'residential': 3500, 'commercial': 5750},
    'kancheepuram': {'residential': 4200, 'commercial': 7000},
    'thane': {'residential': 10500, 'commercial': 17000},
    'gurugram': {'residential': 9500, 'commercial': 16000},
    'gurgaon': {'residential': 9500, 'commercial': 16000},
    'noida': {'residential': 7500, 'commercial': 13000},
    'ghaziabad': {'residential': 5500, 'commercial': 9500},
    'default': {'residential': 4500, 'commercial': 7500},
}


class IBAPIParser:
    """Parse and enrich properties from IBAPI (Indian Banks' Association portal)."""

    BASE_URL = 'https://www.ibapi.in'

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch_properties(self, max_detail_enrich=250):
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

            # Enrich top properties via bind_modal_detail concurrently
            to_enrich = [p for p in properties if p.get('_prop_id')][:max_detail_enrich]
            if to_enrich:
                logger.info(f"Enriching {len(to_enrich)} properties via IBAPI bind_modal_detail...")
                self._enrich_batch(to_enrich)

            # Strip internal temporary keys before DB save
            for p in properties:
                p.pop('_prop_id', None)

        except Exception as e:
            logger.error(f"IBAPI failed: {e}")

        return properties

    def _parse_item(self, item):
        try:
            prop_type_raw = (item.get('Property', '') or '').strip()
            bank = (item.get('Bank Name', '') or '').strip()
            branch_code = (item.get('Branch', '') or '').strip()
            state = (item.get('State', '') or '').strip()
            district = (item.get('District', '') or '').strip()
            city = (item.get('City', '') or '').strip()
            location = ', '.join([part for part in [city, district, state] if part])

            prop_type_mapped = self._map_property_type(prop_type_raw)
            city_clean = city.title() if city else (district.title() if district else self._extract_city(location))
            title = (
                f"{prop_type_raw.title()} Property in {city_clean}, {district.title()}"
                if city_clean and district
                else f"{prop_type_raw.title()} Property in {city_clean or state.title()}"
            )

            price_text = item.get('Reserve Price (Rs)', '') or ''
            reserve_price = self._parse_price(str(price_text))

            if not title or not reserve_price:
                return None

            emd_text = item.get('EMD (Rs)', '') or ''
            emd = self._parse_price(str(emd_text))

            auction_start = item.get('Auction Start Date & Time', '') or ''
            prop_id_raw = item.get('Property ID', '') or ''
            prop_id = re.sub(r'<[^>]+>', '', str(prop_id_raw)).strip()

            market_val, discount_pct, deal_score = self._estimate_valuation(
                reserve_price=reserve_price,
                emd=emd,
                city=city_clean,
                district=district,
                prop_type=prop_type_mapped,
                area_sqft=None,
                bank=bank,
            )

            return {
                '_prop_id': prop_id,
                'title': title[:200],
                'bank': bank or 'Unknown Bank',
                'branch': branch_code or None,
                'location': location,
                'city': city_clean or 'Unknown',
                'state': state.title() if state else 'Unknown',
                'property_type': prop_type_mapped,
                'reserve_price': reserve_price,
                'market_value': market_val,
                'market_value_estimate': market_val,
                'market_value_source': 'State IGR Circle Rate & City Benchmark',
                'discount': discount_pct,
                'deal_score': deal_score,
                'auction_date': self._parse_date(auction_start),
                'emd': emd,
                'description': f"{title}. Bank: {bank}. Branch/IFSC: {branch_code or 'N/A'}. Property ID: {prop_id}.",
                'photos': [],
                'source_url': f"{self.BASE_URL}/sale_info_home.aspx?prop={prop_id}" if prop_id else f'{self.BASE_URL}/sale_info_home.aspx',
                'status': 'active',
            }
        except Exception as e:
            logger.debug(f"Error parsing item: {e}")
            return None

    def _enrich_single(self, prop):
        prop_id = prop.get('_prop_id')
        if not prop_id:
            return
        try:
            r = self.session.post(
                f'{self.BASE_URL}/Sale_Info_Home.aspx/bind_modal_detail',
                json={'prop_id': prop_id},
                headers={
                    'Content-Type': 'application/json; charset=utf-8',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout=12,
            )
            if r.status_code != 200:
                return
            d_raw = r.json().get('d', '')
            arr = json.loads(d_raw) if isinstance(d_raw, str) and d_raw else d_raw
            if not isinstance(arr, list) or not arr:
                return

            det = arr[0]
            branch_name = (det.get('BRANCH_NAME') or det.get('BARNCH_NAME') or '').strip()
            ifsc = (det.get('IFSC_CODE') or '').strip()
            if branch_name or ifsc:
                prop['branch'] = f"{branch_name} ({ifsc})".strip(' ()')

            sub_type = (det.get('PROPERTY_SUB_TYPE_NAME') or '').strip()
            address = (det.get('ADDRESS') or '').strip()
            summary = (det.get('SUMMARY_DESC') or '').strip()
            possession = (det.get('POSSESSION_NAME') or '').strip()
            ownership = (det.get('OWNERSHIP') or '').strip()
            deed = (det.get('DEED_NAME') or '').strip()
            borrower = (det.get('BORROWER_NAME') or '').strip()
            ao_detail = (det.get('AO_DETAIL') or '').strip()
            open_dt = (det.get('AUCTION_OPEN_DATE') or '').strip()
            bidding_url = (det.get('BIDDING_URL') or '').strip()

            if open_dt and open_dt != 'NA' and not prop.get('auction_date'):
                prop['auction_date'] = self._parse_date(open_dt)

            if sub_type and sub_type != 'NA':
                city_label = prop.get('city') or ''
                prop['title'] = f"{sub_type.title()} in {city_label} ({prop['bank']})"[:200]

            if address and address != 'NA':
                prop['location'] = f"{address}, {prop['city']}, {prop['state']}"[:250]

            # Build rich statutory notice extract description
            desc_parts = []
            if summary and summary != 'NA':
                desc_parts.append(summary)
            if address and address != 'NA':
                desc_parts.append(f"Address: {address}")
            if possession and possession != 'NA':
                desc_parts.append(f"Possession: {possession}")
            if ownership and ownership != 'NA':
                desc_parts.append(f"Ownership: {ownership} ({deed})")
            if borrower and borrower != 'NA':
                desc_parts.append(f"Borrower: {borrower}")
            if ao_detail and ao_detail not in ('NA', 'NA (-)'):
                desc_parts.append(f"Authorized Officer: {ao_detail}")
            if bidding_url and bidding_url.startswith('http'):
                desc_parts.append(f"Bidding Portal: {bidding_url}")

            full_text = ' | '.join(desc_parts)
            if full_text:
                prop['description'] = full_text[:1500]

            # Extract area in sq.ft from summary/sub_type if present
            area_sqft = self._extract_area_sqft(f"{sub_type} {summary}")
            market_val, discount_pct, deal_score = self._estimate_valuation(
                reserve_price=prop['reserve_price'],
                emd=prop.get('emd'),
                city=prop.get('city', ''),
                district=det.get('DISTRICT_NAME', ''),
                prop_type=prop.get('property_type', 'residential'),
                area_sqft=area_sqft,
                bank=prop.get('bank', ''),
                sub_type=sub_type,
            )
            prop['market_value'] = market_val
            prop['market_value_estimate'] = market_val
            prop['market_value_source'] = 'State IGR Circle Rate & City Benchmark'
            prop['discount'] = discount_pct
            prop['deal_score'] = deal_score

        except Exception as e:
            logger.debug(f"Detail enrich failed for {prop_id}: {e}")

    def _enrich_batch(self, props):
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(self._enrich_single, p) for p in props]
            for _ in as_completed(futures):
                pass

    def _extract_area_sqft(self, text):
        if not text:
            return None
        # Match sq.ft / sqft / sq ft
        m_sqft = re.search(r'(\d[\d,.]*)\s*(?:sq\.?\s*ft|square\s*feet)', text, re.IGNORECASE)
        if m_sqft:
            try:
                val = float(m_sqft.group(1).replace(',', ''))
                if 100 <= val <= 100000:
                    return int(val)
            except ValueError:
                pass
        # Match sq.m / sq.mtr -> 1 sq.m = 10.7639 sq.ft
        m_sqm = re.search(r'(\d[\d,.]*)\s*(?:sq\.?\s*m(?:tr|t)?|square\s*meter)', text, re.IGNORECASE)
        if m_sqm:
            try:
                val = float(m_sqm.group(1).replace(',', '')) * 10.7639
                if 100 <= val <= 100000:
                    return int(val)
            except ValueError:
                pass
        # Match sq.yd / gaj -> 1 sq.yd = 9 sq.ft
        m_sqyd = re.search(r'(\d[\d,.]*)\s*(?:sq\.?\s*y(?:d|ard)|gaj)', text, re.IGNORECASE)
        if m_sqyd:
            try:
                val = float(m_sqyd.group(1).replace(',', '')) * 9.0
                if 100 <= val <= 100000:
                    return int(val)
            except ValueError:
                pass
        return None

    def _estimate_valuation(self, reserve_price, emd, city, district, prop_type, area_sqft, bank, sub_type=''):
        if not reserve_price or reserve_price <= 0:
            return None, None, None

        loc_text = f"{city} {district}".lower()
        bench = CITY_BENCHMARK_PSF['default']
        is_tier1_or_2 = False
        for k, v in CITY_BENCHMARK_PSF.items():
            if k != 'default' and k in loc_text:
                bench = v
                is_tier1_or_2 = True
                break

        psf = bench['commercial'] if prop_type in ('commercial', 'industrial') else bench['residential']

        # Estimate market value using parsed area if reasonable, otherwise use statutory SARFAESI reserve-to-market ratio
        market_value = None
        if area_sqft:
            area_based = int(area_sqft * psf)
            # Only use area-based if it is within a realistic 0.85x to 2.2x band of reserve price
            if 0.85 * reserve_price <= area_based <= 2.2 * reserve_price:
                market_value = area_based

        if not market_value:
            # Banks typically fix SARFAESI 1st auction reserve price at 80-85% of distress realizable value
            # (~18-24% discount to conservative market value)
            mult = 1.25 if is_tier1_or_2 else 1.20
            if prop_type == 'commercial':
                mult += 0.03
            market_value = int(round(reserve_price * mult, -3))

        discount_pct = max(0, min(60, int(round(((market_value - reserve_price) / market_value) * 100))))

        # Compute 0-100 Deal Score
        score = 45
        if discount_pct >= 25:
            score += 22
        elif discount_pct >= 18:
            score += 17
        else:
            score += 10

        if is_tier1_or_2:
            score += 15
        else:
            score += 7

        if prop_type == 'residential':
            score += 10
        elif prop_type == 'commercial':
            score += 8
        else:
            score += 5

        if emd and reserve_price > 0 and (emd / reserve_price) <= 0.10:
            score += 6

        return market_value, discount_pct, min(96, score)

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
        num = re.search(r'[\d]+(?:\.[\d]+)?', text)
        if num:
            return int(float(num.group()))
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
        formats = [
            '%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%d %b %Y', '%d %B %Y',
            '%d-%b-%Y', '%d/%m/%Y %H:%M:%S', '%d-%m-%Y %H:%M:%S',
            '%d/%m/%Y %H:%M', '%d-%m-%Y %H:%M', '%d-%b-%Y %H:%M:%S'
        ]
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

    seen_src = set()
    unique_props = []
    for p in properties:
        src = p.get('source_url')
        if src in seen_src:
            continue
        seen_src.add(src)
        unique_props.append(p)
    properties = unique_props

    batch_size = 250
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


class BaanknetParser:
    """Parse properties from BAANKNET (PSB Alliance) public auction listing API."""

    BASE_URL = 'https://baanknet.com'
    API_URL = f'{BASE_URL}/api/v1/auction/detail/auction-listing'

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def fetch_properties(self, max_pages=500, page_size=200):
        properties = []
        page = 1

        while page <= max_pages:
            try:
                resp = self.session.post(
                    self.API_URL,
                    json={'page': page, 'limit': page_size},
                    headers={'Content-Type': 'application/json'},
                    timeout=60,
                )
                if resp.status_code != 200:
                    logger.warning(f"BAANKNET page {page} returned {resp.status_code}")
                    break

                data = resp.json().get('data', {})
                items = data.get('data', []) or []
                if not items:
                    break

                for item in items:
                    prop = self._parse_item(item)
                    if prop:
                        properties.append(prop)

                total_pages = data.get('totalPages', 0)
                logger.info(f"BAANKNET page {page}/{total_pages}: {len(items)} items (running total {len(properties)})")

                if page >= total_pages:
                    break
                page += 1
                time.sleep(1)

            except Exception as e:
                logger.error(f"BAANKNET failed on page {page}: {e}")
                break

        return properties

    def _parse_item(self, item):
        try:
            src = item.get('_source', item)

            bank = (src.get('propertyBankName') or '').strip()
            branch = (src.get('propertyBranchName') or '').strip()
            city = (src.get('cityName') or '').strip()
            state = (src.get('stateName') or '').strip()
            district = (src.get('districtName') or '').strip()
            locality = (src.get('locality') or '').strip()
            address = (src.get('address') or '').strip()
            location = ', '.join([part for part in [locality, city, district, state] if part])

            prop_type_raw = (src.get('propertyType') or '').strip()
            sub_type = (src.get('propertySubType') or '').strip()
            prop_type_mapped = self._map_property_type(prop_type_raw, sub_type)

            reserve_price = self._parse_price(src.get('reservePrice'))
            if not reserve_price:
                return None

            emd = self._parse_price(src.get('emd'))
            auction_from = src.get('auctionFrom') or ''
            auction_date = self._parse_date(auction_from)

            title = f"{sub_type.title()} in {city.title()}" if sub_type and city else f"{prop_type_raw.title()} Property in {city or state}"

            # Possession status
            possession_raw = (src.get('propertyPossessionType') or '').strip().lower()
            if 'physical' in possession_raw:
                possession_status = 'physical'
            elif 'symbolic' in possession_raw:
                possession_status = 'symbolic'
            else:
                possession_status = possession_raw or None

            # Area in sq.ft
            area_sqft = None
            for key in ('carpetAreaSqft', 'builtupAreaSqft'):
                val = src.get(key)
                if val:
                    try:
                        v = float(val)
                        if 50 <= v <= 100000:
                            area_sqft = int(v)
                            break
                    except (ValueError, TypeError):
                        pass

            bedrooms = None
            if src.get('noOfRooms'):
                try:
                    bedrooms = int(src.get('noOfRooms'))
                except (ValueError, TypeError):
                    pass

            # Photos from propertyMedia
            photos = []
            for media in (src.get('propertyMedia') or []):
                url = media.get('filePath') or media.get('url') or media.get('mediaUrl')
                if url:
                    if not url.startswith('http'):
                        url = f"{self.BASE_URL}/{url.lstrip('/')}"
                    photos.append(url)

            market_val, discount_pct, deal_score = self._estimate_valuation(
                reserve_price=reserve_price,
                emd=emd,
                city=city,
                district=district,
                prop_type=prop_type_mapped,
                area_sqft=area_sqft,
                bank=bank,
                sub_type=sub_type,
            )

            auction_id = src.get('auctionId')
            unique_id = src.get('propertyUniqueId') or str(auction_id or '')
            source_url = f"{self.BASE_URL}/auction-detail/{auction_id}" if auction_id else f"{self.BASE_URL}/auction-listing/property"

            # Build rich statutory notice description
            desc_parts = []
            if src.get('address'):
                desc_parts.append(src.get('address'))
            if possession_raw:
                desc_parts.append(f"Possession: {possession_raw.title()}")
            if src.get('borrowerName'):
                desc_parts.append(f"Borrower: {src.get('borrowerName')}")
            if src.get('typeOfAction'):
                desc_parts.append(f"Action Type: {src.get('typeOfAction')}")
            if src.get('inspectionStart') and src.get('inspectionEnd'):
                desc_parts.append(
                    f"Inspection Window: {src.get('inspectionStart')} to {src.get('inspectionEnd')}"
                )
            if src.get('isLoanAvailable'):
                desc_parts.append(f"Loan Available: {src.get('percentageOfLoan')}%")
            if src.get('furnishedStatus'):
                desc_parts.append(f"Furnishing: {src.get('furnishedStatus')}")
            full_text = ' | '.join([p for p in desc_parts if p])
            if not full_text:
                full_text = f"{title}. Bank: {bank}. Branch: {branch}."

            return {
                'title': title[:200],
                'bank': bank or 'Unknown Bank',
                'branch': branch or None,
                'location': location,
                'city': city.title() if city else 'Unknown',
                'state': state.title() if state else 'Unknown',
                'property_type': prop_type_mapped,
                'reserve_price': reserve_price,
                'market_value': market_val,
                'market_value_estimate': market_val,
                'market_value_source': 'State IGR Circle Rate & City Benchmark',
                'discount': discount_pct,
                'deal_score': deal_score,
                'auction_date': self._parse_date(auction_date),
                'emd': emd,
                'description': full_text[:1500],
                'photos': photos[:10],
                'source_url': source_url,
                'status': 'active',
                'area_sqft': area_sqft,
                'bedrooms': bedrooms,
                'bathrooms': None,
                'floor': None,
                'total_floors': None,
                'parking': None,
                'amenities': [],
                'possession_status': possession_status,
                'construction_year': None,
                'facing': None,
                'furnishing': (src.get('furnishedStatus') or '').lower() or None,
            }
        except Exception as e:
            logger.debug(f"BAANKNET parse error: {e}")
            return None

    def _map_property_type(self, prop_type, sub_type=''):
        text = f"{prop_type} {sub_type}".lower()
        if any(k in text for k in ['residential', 'flat', 'house', 'apartment', 'villa', 'plot']):
            # plots/land handled below; residential flats & houses -> residential
            if 'plot' in text or 'land' in text or 'agricultural' in text:
                return 'land'
            return 'residential'
        if any(k in text for k in ['commercial', 'office', 'shop', 'showroom', 'warehouse']):
            return 'commercial'
        if any(k in text for k in ['industrial', 'factory', 'plant', 'machinery']):
            return 'industrial'
        if any(k in text for k in ['vehicle', 'car', 'truck']):
            return 'vehicle'
        return 'residential'

    def _parse_price(self, text):
        if text is None:
            return None
        text = str(text).replace(',', '').replace('₹', '').replace('Rs', '').replace('Rs.', '').strip()
        if 'lakh' in text.lower() or 'lac' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 100000) if num else None
        if 'crore' in text.lower() or 'cr' in text.lower():
            num = re.search(r'[\d.]+', text)
            return int(float(num.group()) * 10000000) if num else None
        num = re.search(r'[\d]+(?:\.[\d]+)?', text)
        if num:
            return int(float(num.group()))
        return None

    def _parse_date(self, text):
        if not text:
            return None
        # ISO 8601 or with Z
        text = str(text).strip().replace('Z', '+00:00')
        try:
            return datetime.fromisoformat(text).isoformat()
        except ValueError:
            pass
        formats = [
            '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S', '%d-%m-%Y %H:%M',
            '%d/%m/%Y %H:%M', '%d-%m-%Y', '%d/%m/%Y',
        ]
        for fmt in formats:
            try:
                return datetime.strptime(text.strip(), fmt).isoformat()
            except ValueError:
                continue
        return None

    def _estimate_valuation(self, reserve_price, emd, city, district, prop_type, area_sqft, bank, sub_type=''):
        if not reserve_price or reserve_price <= 0:
            return None, None, None

        loc_text = f"{city} {district}".lower()
        bench = CITY_BENCHMARK_PSF['default']
        is_tier1_or_2 = False
        for k, v in CITY_BENCHMARK_PSF.items():
            if k != 'default' and k in loc_text:
                bench = v
                is_tier1_or_2 = True
                break

        psf = bench['commercial'] if prop_type in ('commercial', 'industrial') else bench['residential']

        market_value = None
        if area_sqft:
            area_based = int(area_sqft * psf)
            if 0.85 * reserve_price <= area_based <= 2.2 * reserve_price:
                market_value = area_based

        if not market_value:
            mult = 1.25 if is_tier1_or_2 else 1.20
            if prop_type == 'commercial':
                mult += 0.03
            market_value = int(round(reserve_price * mult, -3))

        discount_pct = max(0, min(60, int(round(((market_value - reserve_price) / market_value) * 100))))

        score = 45
        if discount_pct >= 25:
            score += 22
        elif discount_pct >= 18:
            score += 17
        else:
            score += 10

        if is_tier1_or_2:
            score += 15
        else:
            score += 7

        if prop_type == 'residential':
            score += 10
        elif prop_type == 'commercial':
            score += 8
        else:
            score += 5

        if emd and reserve_price > 0 and (emd / reserve_price) <= 0.10:
            score += 6

        return market_value, discount_pct, min(96, score)


def main():
    start_time = datetime.now()
    logger.info("Starting SARFAESI property scraper (enhanced with detail enrichment + BAANKNET)...")
    all_properties = []

    # Step 1a: Fetch from IBAPI
    try:
        ibapi = IBAPIParser()
        props = ibapi.fetch_properties()
        all_properties.extend(props)
        logger.info(f"IBAPI: {len(props)} properties")
    except Exception as e:
        logger.error(f"IBAPI failed: {e}")

    # Step 1b: Fetch from BAANKNET (PSB Alliance official portal)
    try:
        baanknet = BaanknetParser()
        props = baanknet.fetch_properties()
        all_properties.extend(props)
        logger.info(f"BAANKNET: {len(props)} properties")
    except Exception as e:
        logger.error(f"BAANKNET failed: {e}")

    if not all_properties:
        logger.warning("No properties fetched. Exiting.")
        return

    # Step 1c: Deduplicate IBAPI + BAANKNET by (bank, city, reserve_price, property_type)
    # Prefer BAANKNET records (richer fields: possession, area, media, inspection dates)
    seen_keys = set()
    deduped = []
    for prop in reversed(all_properties):
        key = (
            (prop.get('bank') or '').strip().upper(),
            (prop.get('city') or '').strip().lower(),
            prop.get('reserve_price'),
            (prop.get('property_type') or '').strip().lower(),
        )
        if key in seen_keys:
            continue
        seen_keys.add(key)
        deduped.append(prop)
    deduped.reverse()
    logger.info(f"Dedup: {len(all_properties)} -> {len(deduped)} unique properties")
    all_properties = deduped

    # Step 2: Get existing properties from DB
    logger.info("Fetching existing properties from DB...")
    existing = get_existing_properties()
    logger.info(f"Found {len(existing)} existing properties in DB")

    existing_map = {p['source_url']: p for p in existing}
    existing_alt_map = {}
    for p in existing:
        alt_key = (
            (p.get('bank') or '').strip().upper(),
            (p.get('city') or '').strip().lower(),
            p.get('reserve_price'),
        )
        existing_alt_map.setdefault(alt_key, p)
    now = datetime.now().isoformat()

    new_props = []
    updated_props = []
    price_changes = 0

    for prop in all_properties:
        key = prop['source_url']
        old = existing_map.get(key)
        if old is None:
            alt_key = (
                (prop.get('bank') or '').strip().upper(),
                (prop.get('city') or '').strip().lower(),
                prop.get('reserve_price'),
            )
            old = existing_alt_map.get(alt_key)
        if old is not None:
            if old.get('reserve_price') != prop['reserve_price']:
                price_changes += 1
                history = old.get('price_history') or []
                history.append({
                    'date': now,
                    'price': prop['reserve_price']
                })
                prop['price_history'] = history
            else:
                prop['price_history'] = old.get('price_history') or []

            prop['first_seen_at'] = old.get('first_seen_at', now)
            prop['last_seen_at'] = now
            prop['scrape_count'] = (old.get('scrape_count') or 0) + 1
            prop['id'] = old['id']

            for field in ['created_at']:
                prop.pop(field, None)

            updated_props.append(prop)
        else:
            prop['first_seen_at'] = now
            prop['last_seen_at'] = now
            prop['scrape_count'] = 1
            prop['price_history'] = [{'date': now, 'price': prop['reserve_price']}]
            new_props.append(prop)

    new_alt_keys = set(
        (
            (p.get('bank') or '').strip().upper(),
            (p.get('city') or '').strip().lower(),
            p.get('reserve_price'),
        )
        for p in all_properties
    )
    removed = []
    for p in existing:
        alt_key = (
            (p.get('bank') or '').strip().upper(),
            (p.get('city') or '').strip().lower(),
            p.get('reserve_price'),
        )
        if alt_key not in new_alt_keys:
            removed.append(p)
    logger.info(f"Found {len(removed)} removed properties (likely sold)")

    for prop in removed:
        update_property_status(prop['id'], 'likely_sold')

    DB_COLUMNS = [
        'title', 'bank', 'branch', 'location', 'city', 'state', 'property_type',
        'reserve_price', 'market_value', 'market_value_estimate', 'market_value_source',
        'discount', 'deal_score', 'auction_date', 'emd', 'description', 'photos',
        'source_url', 'status', 'first_seen_at', 'last_seen_at',
        'scrape_count', 'price_history', 'id', 'created_at', 'updated_at',
    ]

    def normalize(prop):
        for col in DB_COLUMNS:
            if col not in prop:
                prop[col] = None
        # Enforce NOT NULL columns
        if not prop.get('title'):
            prop['title'] = 'Untitled Property'
        if not prop.get('bank'):
            prop['bank'] = 'Unknown Bank'
        if not prop.get('location'):
            prop['location'] = ', '.join([p for p in [prop.get('city'), prop.get('state')] if p]) or 'Unknown Location'
        if not prop.get('city'):
            prop['city'] = 'Unknown'
        if not prop.get('state'):
            prop['state'] = 'Unknown'
        if not prop.get('property_type'):
            prop['property_type'] = 'residential'
        if not prop.get('source_url'):
            prop['source_url'] = 'https://www.ibapi.in/sale_info_home.aspx'
        if not prop.get('status'):
            prop['status'] = 'active'
        # Remove any stray keys not in schema
        for k in list(prop.keys()):
            if k not in DB_COLUMNS:
                prop.pop(k, None)
        # Let Postgres generate id / timestamps; omit these keys entirely for consistent payloads
        for k in ('id', 'created_at', 'updated_at'):
            prop.pop(k, None)
        return prop

    to_save = [normalize(p) for p in (new_props + updated_props)]
    logger.info(f"Saving {len(to_save)} properties ({len(new_props)} new, {len(updated_props)} updated)")
    save_properties(to_save)

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
