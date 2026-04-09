import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip');
  
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'Invalid zip code' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Zip code not found' }, { status: 404 });
    }

    const data = await response.json();
    const place = data.places?.[0];

    if (!place) {
      return NextResponse.json({ error: 'No location data' }, { status: 404 });
    }

    return NextResponse.json({
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
      city: place['place name'],
      state: place['state abbreviation'],
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
