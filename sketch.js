let config;
let datetime = moment();
let myTzOffset = moment().utcOffset();

// Default viewing location: Colombo, Sri Lanka
let myLat = 6.9;
let myLon = 79.9;

// Attempt to set actual location data if allowed by user
navigator.geolocation.getCurrentPosition((pos) => {
  myLat = pos.coords.latitude;
  myLon = pos.coords.longitude;
});

const constructLocString = (degrees, type) => {
  if (degrees >= 0) {
    indicator = type === "lat" ? "N" : "E";
  } else {
    indicator = type === "lat" ? "S" : "W";
    degrees = degrees * -1;
  }
  const wholeDegrees = Math.floor(degrees);
  return `${wholeDegrees}${indicator}${degrees % wholeDegrees}`;
};

const extractMoonPhaseIndex = (phaseString) => {
  if (!phaseString) {
    return 15;
  }
  const split = phaseString.split("/");
  return parseInt(split[0]) + (split[1][0] === "K" ? 0 : 15);
};

const drawMoon = (posX, posY, size, color, moonPhase, moonShadow) => {
  const moonPhaseIndex = extractMoonPhaseIndex(moonPhase);
  noStroke();
  angleMode(RADIANS);

  a = map(moonPhaseIndex, 1, 30, 0, -Math.PI * 2);
  a %= -Math.PI * 2;

  let color1 = color;
  let color2 = color;
  let color3 = color;
  let color4 = color;

  if (-Math.PI / 2 < a && a < 0) {
    color3 = color;
    color4 = color;
    color1 = color;
    color2 = moonShadow;
  } else if (-Math.PI < a && a < -Math.PI / 2) {
    color1 = color;
    color3 = moonShadow;
    color4 = moonShadow;
    color2 = moonShadow;
  } else if ((-3 * Math.PI) / 2 < a && a < -Math.PI) {
    color4 = moonShadow;
    color2 = color;
    color1 = moonShadow;
    color3 = moonShadow;
  } else if (-2 * Math.PI < a && a < (-3 * Math.PI) / 2) {
    color4 = color;
    color3 = color;
    color1 = moonShadow;
    color2 = color;
  }

  fill(color1);
  arc(posX, posY, size, size, PI / 2, (3 * PI) / 2);

  fill(color2);
  arc(posX, posY, size, size, (3 * PI) / 2, PI / 2);

  let heightPhase = size;
  let widthPhase = map(Math.cos(a), 0, 1, 0, size);

  fill(color3);
  arc(posX, posY, widthPhase - 2, heightPhase + 1, PI / 2, (3 * PI) / 2);

  fill(color4);
  arc(posX, posY, widthPhase - 2, heightPhase + 1, (3 * PI) / 2, PI / 2);

  stroke(18);
  strokeWeight(2);
  noFill();
  ellipse(posX, posY, size, size);
  angleMode(DEGREES);
};

function setup() {
  config = {
    playback: {
      direction: "add",
      unit: "d",
      step: 1,
    },
    scale: 2,
    backgroundColor: color("#222"),
    moonShadow: color("#5e4841"),
    planets: {
      Su: { char: "☉", size: 0.8, color: color("#ffc107") },
      Mo: { char: "☽", size: 0.3, color: color("#bdbdbd") },
      Me: { char: "☿", size: 0.2, color: color("#00bcd4") },
      Ve: { char: "♀", size: 0.3, color: color("#f46dab") },
      Ma: { char: "♂", size: 0.4, color: color("#e91e63") },
      Ju: { char: "♃", size: 0.8, color: color("#673ab7") },
      Sa: { char: "♄", size: 0.6, color: color("#05cd6a") },
    },
    zodiac: [
      { name: "Aries", shortName: "Ari" },
      { name: "Taurus", shortName: "Tau" },
      { name: "Gemini", shortName: "Gem" },
      { name: "Cancer", shortName: "Can" },
      { name: "Leo", shortName: "Leo" },
      { name: "Virgo", shortName: "Vir" },
      { name: "Libra", shortName: "Lib" },
      { name: "Scorpio", shortName: "Sco" },
      { name: "Sagittarius", shortName: "Sag" },
      { name: "Capricorn", shortName: "Cap" },
      { name: "Aquarius", shortName: "Aqu" },
      { name: "Pisces", shortName: "Pis" },
    ],
  };
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
}

function draw() {
  const {
    playback: { direction, unit, step },
    scale,
    backgroundColor,
    zodiac: zodiacConfig,
    planets: planetsConfig,
    moonShadow,
  } = config;
  datetime = datetime[direction](step, unit);
  const date = datetime.format("YYYY/MM/DD");
  const time = datetime.format("HH:mm");
  const { positions, moonPhase } = get_positions(
    date,
    time,
    moment.duration(moment.duration(myTzOffset, "minutes")).asHours(),
    constructLocString(myLat, "lat"),
    constructLocString(myLon, "lon")
  );

  background(backgroundColor);

  textSize(12 * scale);

  translate(width / 2, height / 2);

  noStroke();
  fill(30);

  fill(60);
  stroke(60);

  text(`${date}`, -28 * scale, 16 * scale);
  text(`${time}`, -16 * scale, -10 * scale);

  text("E", 80 * scale, -12 * scale);

  fill(50);
  stroke(50);
  text("W", -86 * scale, -12 * scale);

  noFill();
  strokeWeight(90 * scale);

  stroke(30);
  ellipse(0, 0, 300 * scale, 300 * scale);
  strokeWeight(1 * scale);
  stroke(100);

  const asc = positions.find((p) => p.name === "As");
  const planets = positions.filter((p) => p.name !== "As");

  const ascIndex = zodiacConfig.findIndex((z) => z.name === asc.zodiac);
  if (ascIndex === -1) {
    console.error(`Invalid ascendant ${asc.zodiac}`);
  }

  const zodiac = [
    ...zodiacConfig.slice(ascIndex, zodiacConfig.length),
    ...zodiacConfig.slice(0, ascIndex),
  ];

  zodiac.forEach((constellation, index) => {
    push();
    rotate(-90);
    rotate((index * 30 - asc.degree) % 360);
    stroke(index <= 1 ? 100 : 50);
    strokeWeight(2 * scale);
    line(0, 110 * scale, 0, 190 * scale);
    noStroke();
    fill(index === 0 ? 100 : 50);
    push();
    translate(-35 * scale, 170 * scale);
    rotate(196);
    text(constellation.shortName, 0, 0);
    pop();
    pop();
  });

  planets.forEach((planet) => {
    const planetConfig = planetsConfig[planet.name];
    if (!planetConfig) return;

    const size = planetConfig.size * 20 * scale;
    const color = planetConfig.color;
    const posX = 0;
    const posY = 140;
    const rotation = (planet.ra - asc.ra) % 360;

    push();
    rotate(-90);
    strokeWeight(2 * scale);
    stroke(50);
    line(0, 0, 0, -95 * scale);
    stroke(100);
    line(0, 0, 0, 95 * scale);
    noStroke();
    rotate(rotation);
    stroke(18);
    strokeWeight(2 * scale);

    fill(18);
    ellipse(
      posX * scale + 2 * scale,
      posY * scale + 2 * scale,
      size * 1.1 * scale,
      size * 1.1 * scale
    );

    if (planet.name === "Mo") {
      drawMoon(
        posX * scale,
        posY * scale,
        size * scale,
        color,
        moonPhase,
        moonShadow
      );
    } else {
      fill(color);
      ellipse(posX * scale, posY * scale, size * scale, size * scale);
    }

    pop();
  });
}
