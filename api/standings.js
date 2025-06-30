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

const fallbackData = {
  constructorStandings: [
    { position: 1, team: "Red Bull", points: 860 },
    { position: 2, team: "Mercedes", points: 409 },
    { position: 3, team: "Ferrari", points: 406 },
    { position: 4, team: "McLaren", points: 302 },
    { position: 5, team: "Aston Martin", points: 280 }
  ],
  driverP1: {
    name: "Max Verstappen",
    driverId: "max_verstappen",
    team: "Red Bull",
    points: 575
  }
};

export default async function handler(req, res) {
  try {
    const jolpiHeaders = {
      "X-RapidAPI-Key": process.env.JOLPI_API_KEY,
      "X-RapidAPI-Host": "jolpi.p.rapidapi.com"
    };

    const [cRes, dRes] = await Promise.all([
      fetch("https://jolpi.p.rapidapi.com/api/v1/f1/standings/constructors", { headers: jolpiHeaders }),
      fetch("https://jolpi.p.rapidapi.com/api/v1/f1/standings/drivers", { headers: jolpiHeaders })
    ]);

    const cJson = await cRes.json();
    const dJson = await dRes.json();

    const constructors = cJson?.data?.slice(0, 10).map(item => {
      const nm = item.team.name;
      const a = teamAssets[nm] || {};
      return {
        position: item.position,
        team: nm,
        points: item.points,
        logo: a.logo,
        car: a.car,
        color: a.color
      };
    });

    const dr = dJson?.data?.[0];
    const driverName = dr.driver.fullName;
    const driverTeam = dr.team.name;
    const driverId = dr.driver.id;
    const driverPoints = dr.points;
    const driverPhoto = driverPhotos[driverId] || null;
    const gradient = ["#000000", teamAssets[driverTeam]?.color || "#FFFFFF"];

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json({
      driverP1: {
        name: driverName,
        photo: driverPhoto,
        team: driverTeam,
        points: driverPoints
      },
      backgroundGradient: gradient,
      standings: constructors,
      lastUpdated: new Date().toISOString(),
      dataSource: "jolpi"
    });

  } catch (e) {
    const team = fallbackData.driverP1.team;
    const gradient = ["#000000", teamAssets[team]?.color || "#FFFFFF"];
    res.status(200).json({
      driverP1: {
        name: fallbackData.driverP1.name,
        photo: driverPhotos[fallbackData.driverP1.driverId] || null,
        team,
        points: fallbackData.driverP1.points
      },
      backgroundGradient: gradient,
      standings: fallbackData.constructorStandings.map(item => {
        const a = teamAssets[item.team] || {};
        return { ...item, logo: a.logo, car: a.car, color: a.color };
      }),
      lastUpdated: new Date().toISOString(),
      dataSource: "fallback",
      warning: "Données non actualisées – problème de connexion API"
    });
  }
}
