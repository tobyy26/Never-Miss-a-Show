export async function onRequestPost(context) {
  try {
    const { lat, lon, radius, artists } = await context.request.json();
    
    // Grabs your secret environment API key from Cloudflare variables safely
    const apiKey = context.env.TICKETMASTER_API_KEY; 
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Ticketmaster API Key is missing on host settings." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    let allShows = [];

    // Loop through each tracked artist and query Ticketmaster
    for (const artist of artists) {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&keyword=${encodeURIComponent(artist)}&latlong=${lat},${lon}&radius=${radius}&unit=miles&classificationName=music&size=5`;
      
      const res = await fetch(url);
      if (res.status === 200) {
        const data = await res.json();
        
        if (data._embedded && data._embedded.events) {
          const events = data._embedded.events.map(event => ({
            name: event.name,
            date: event.dates.start.localDate,
            venue: event._embedded?.venues?.[0]?.name || "Unknown Venue",
            url: event.url
          }));
          allShows.push(...events);
        }
      }
      
      // Brief rate-limiting pause to avoid flooding free Ticketmaster tiers
      await new Promise(resolve => setTimeout(resolve, 200)); 
    }

    // Return the collated array sorted by earliest date
    allShows.sort((a, b) => new Date(a.date) - new Date(b.date));

    return new Response(JSON.stringify({ shows: allShows }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
