const teamAssets = {
  "Red Bull": { logo: "...", car: "...", color: "#1E41FF" },
  "Mercedes": { logo: "...", car: "...", color: "#00D2BE" },
  "Ferrari": { logo: "...", car: "...", color: "#E80020" },
  "McLaren": { logo: "...", car: "...", color: "#FF8700" },
  "Aston Martin": { logo: "...", car: "...", color: "#006F62" },
  "Alpine F1 Team": { logo: "...", car: "...", color: "#2293D1" },
  "Visa Cash App RB": { logo: "...", car: "...", color: "#6692FF" },
  "Williams": { logo: "...", car: "...", color: "#37BEDD" },
  "Stake F1 Team Kick Sauber": { logo: "...", car: "...", color: "#52E252" },
  "Haas F1 Team": { logo: "...", car: "...", color: "#B6BABD" }
};

const driverPhotos = {
  "max_verstappen": "https://media.formula1.com/digital-assets/drivers/2024/MAX.jpg",
  "lewis_hamilton": "https://media.formula1.com/digital-assets/drivers/2024/LEW.jpg",
  "charles_leclerc": "https://media.formula1.com/digital-assets/drivers/2024/LEC.jpg",
  "lando_norris": "https://media.formula1.com/digital-assets/drivers/2024/NOR.jpg",
  "fernando_alonso": "https://media.formula1.com/digital-assets/drivers/2024/ALO.jpg",
  "george_russell": "https://media.formula1.com/digital-assets/drivers/2024/RUS.jpg"
};

export default async function handler(req, res) {
  try {
    const [cRes, dRes] = await Promise.all([
      fetch('https://ergast.com/api/f1/current/constructorStandings.json'),
      fetch('https://ergast.com/api/f1/current/driverStandings.json')
    ]);

    if (!cRes.ok || !dRes.ok) {
      throw new Error(`API Error: constructors ${cRes.status}, drivers ${dRes.status}`);
    }

    const cData = await cRes.json();
    const dData = await dRes.json();

    const standingsRaw = cData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
    const standings = standingsRaw.map(item => {
      const nm = item.Constructor.name;
      const a = teamAssets[nm] || {};
      return { 
        position: item.position, 
        team: nm, 
        points: item.points, 
        logo: a.logo || null, 
        car: a.car || null 
      };
    });

    const dr = dData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];
    if (!dr) throw new Error("Driver standings data missing");

    const name = dr.Driver.givenName + ' ' + dr.Driver.familyName;
    const img = driverPhotos[dr.Driver.driverId] || null;
    const team = dr.Constructors?.[0]?.name || "Unknown";
    const gradient = ["#000000", teamAssets[team]?.color || "#FFFFFF"];

    res.setHeader('Cache-Control', 's-maxage=3600');
    res.status(200).json({
      driverP1: { name, photo: img, team, points: dr.points },
      backgroundGradient: gradient,
      standings
    });
  } catch (err) {
    console.error("F1 Widget API error:", err);
    res.status(500).json({ error: "Erreur récupération F1." });
  }
}
