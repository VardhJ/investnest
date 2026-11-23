"""
Sample SARFAESI Property Data
Run this to populate your database with sample properties for testing.
Usage: python sample_data.py
"""

import json
import os
from datetime import datetime, timedelta

# Sample properties for testing (replace with real scraper data later)
sample_properties = [
    {
        "title": "2BHK Flat in Andheri West, Mumbai",
        "bank": "State Bank of India",
        "branch": "Andheri West Branch",
        "location": "Andheri West, Mumbai, Maharashtra",
        "city": "Mumbai",
        "state": "Maharashtra",
        "property_type": "residential",
        "reserve_price": 8500000,
        "market_value": 12000000,
        "discount": 29.17,
        "auction_date": (datetime.now() + timedelta(days=15)).isoformat(),
        "emd": 850000,
        "description": "2BHK apartment, 750 sq ft, 5th floor, with parking. Located in prime Andheri West area near metro station.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/1",
        "status": "active",
    },
    {
        "title": "3BHK Apartment in Whitefield, Bangalore",
        "bank": "Punjab National Bank",
        "branch": "Whitefield Branch",
        "location": "Whitefield, Bangalore, Karnataka",
        "city": "Bangalore",
        "state": "Karnataka",
        "property_type": "residential",
        "reserve_price": 9500000,
        "market_value": 13000000,
        "discount": 26.92,
        "auction_date": (datetime.now() + timedelta(days=22)).isoformat(),
        "emd": 950000,
        "description": "3BHK apartment, 1200 sq ft, 8th floor, with 2 parking spots. Near ITPL and metro station.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/2",
        "status": "active",
    },
    {
        "title": "Commercial Shop in Connaught Place, Delhi",
        "bank": "HDFC Bank",
        "branch": "Connaught Place Branch",
        "location": "Connaught Place, New Delhi, Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "property_type": "commercial",
        "reserve_price": 25000000,
        "market_value": 35000000,
        "discount": 28.57,
        "auction_date": (datetime.now() + timedelta(days=30)).isoformat(),
        "emd": 2500000,
        "description": "Ground floor commercial shop, 400 sq ft, in prime Connaught Place location. High footfall area.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/3",
        "status": "active",
    },
    {
        "title": "Industrial Plot in Pune MIDC",
        "bank": "Bank of Baroda",
        "branch": "Pune Industrial Branch",
        "location": "MIDC, Pune, Maharashtra",
        "city": "Pune",
        "state": "Maharashtra",
        "property_type": "industrial",
        "reserve_price": 15000000,
        "market_value": 20000000,
        "discount": 25.00,
        "auction_date": (datetime.now() + timedelta(days=18)).isoformat(),
        "emd": 1500000,
        "description": "Industrial plot, 5000 sq ft, in established MIDC area. Suitable for manufacturing or warehouse.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/4",
        "status": "active",
    },
    {
        "title": "3BHK Villa in Gachibowli, Hyderabad",
        "bank": "ICICI Bank",
        "branch": "Gachibowli Branch",
        "location": "Gachibowli, Hyderabad, Telangana",
        "city": "Hyderabad",
        "state": "Telangana",
        "property_type": "residential",
        "reserve_price": 18000000,
        "market_value": 25000000,
        "discount": 28.00,
        "auction_date": (datetime.now() + timedelta(days=12)).isoformat(),
        "emd": 1800000,
        "description": "Independent villa, 2200 sq ft, with garden and 2-car parking. Near HITEC City.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/5",
        "status": "active",
    },
    {
        "title": "2BHK Flat in Salt Lake, Kolkata",
        "bank": "Canara Bank",
        "branch": "Salt Lake Branch",
        "location": "Salt Lake, Kolkata, West Bengal",
        "city": "Kolkata",
        "state": "West Bengal",
        "property_type": "residential",
        "reserve_price": 5500000,
        "market_value": 7500000,
        "discount": 26.67,
        "auction_date": (datetime.now() + timedelta(days=25)).isoformat(),
        "emd": 550000,
        "description": "2BHK flat, 850 sq ft, 3rd floor. Well-maintained building with lift and parking.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/6",
        "status": "active",
    },
    {
        "title": "Commercial Office in SG Highway, Ahmedabad",
        "bank": "Axis Bank",
        "branch": "SG Highway Branch",
        "location": "SG Highway, Ahmedabad, Gujarat",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "property_type": "commercial",
        "reserve_price": 12000000,
        "market_value": 16000000,
        "discount": 25.00,
        "auction_date": (datetime.now() + timedelta(days=20)).isoformat(),
        "emd": 1200000,
        "description": "Office space, 1500 sq ft, on SG Highway. Ideal for IT/ITES companies.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/7",
        "status": "active",
    },
    {
        "title": "Agricultural Land in Jaipur Outskirts",
        "bank": "Union Bank of India",
        "branch": "Jaipur Branch",
        "location": "Outskirts, Jaipur, Rajasthan",
        "city": "Jaipur",
        "state": "Rajasthan",
        "property_type": "land",
        "reserve_price": 4000000,
        "market_value": 5500000,
        "discount": 27.27,
        "auction_date": (datetime.now() + timedelta(days=35)).isoformat(),
        "emd": 400000,
        "description": "Agricultural land, 2 acres, with water access. Suitable for farmhouse or investment.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/8",
        "status": "active",
    },
    {
        "title": "1BHK Studio in Chennai",
        "bank": "Indian Bank",
        "branch": "T Nagar Branch",
        "location": "T Nagar, Chennai, Tamil Nadu",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "property_type": "residential",
        "reserve_price": 3500000,
        "market_value": 4800000,
        "discount": 27.08,
        "auction_date": (datetime.now() + timedelta(days=10)).isoformat(),
        "emd": 350000,
        "description": "1BHK studio apartment, 450 sq ft. Compact living space in prime T Nagar location.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/9",
        "status": "active",
    },
    {
        "title": "Warehouse in Lucknow Industrial Area",
        "bank": "Bank of India",
        "branch": "Lucknow Industrial Branch",
        "location": "Industrial Area, Lucknow, Uttar Pradesh",
        "city": "Lucknow",
        "state": "Uttar Pradesh",
        "property_type": "industrial",
        "reserve_price": 8000000,
        "market_value": 11000000,
        "discount": 27.27,
        "auction_date": (datetime.now() + timedelta(days=28)).isoformat(),
        "emd": 800000,
        "description": "Warehouse, 3000 sq ft, with loading dock and office space. Near highway.",
        "photos": [],
        "source_url": "https://www.ibapi.in/property/10",
        "status": "active",
    },
]


def save_to_supabase():
    """Save sample properties to Supabase via REST API."""
    import os
    import requests
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_KEY')

    if not url or not key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local")
        print("   Falling back to JSON file...")
        save_to_json()
        return

    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates',
    }

    try:
        resp = requests.post(
            f'{url}/rest/v1/properties',
            headers=headers,
            json=sample_properties,
            timeout=30
        )
        if resp.status_code in (200, 201):
            data = resp.json()
            print(f"✅ Saved {len(data)} properties to Supabase")
        else:
            print(f"❌ Supabase error ({resp.status_code}): {resp.text[:200]}")
            save_to_json()
    except Exception as e:
        print(f"❌ Supabase error: {e}")
        save_to_json()


def save_to_json():
    """Fallback: save to JSON file."""
    output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'properties.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(sample_properties, f, indent=2, default=str)
    print(f"✅ Saved {len(sample_properties)} properties to {output_path}")


if __name__ == '__main__':
    print("Loading sample SARFAESI property data...")
    save_to_supabase()
    print("Done! Check your Supabase dashboard or data/properties.json")