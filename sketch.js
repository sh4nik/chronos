let config;
let datetime = moment();
let myTzOffset = moment().utcOffset();

const switchToLiveMode = (e) => {
  e.stopPropagation();
  e.preventDefault();
  config.playbackType = PLAYBACK_TYPES.LIVE;
  datetime = moment();
};

const applyInput = (e) => {
  e.stopPropagation();
  e.preventDefault();
  const selectedDate = document.getElementById("selectedDate").value;
  const selectedTime = document.getElementById("selectedTime").value;
  const selectedPlayback = document.getElementById("selectedPlayback").value;
  datetime = moment(
    `${selectedDate || moment().format("YYYY-MM-DD")} ${
      selectedTime || moment().format("HH:mm")
    }`
  );

  if (selectedPlayback === "paused") {
    config.playbackType = PLAYBACK_TYPES.STATIC;
  } else {
    const settings = selectedPlayback.split("-");
    config.playbackType = PLAYBACK_TYPES.CONF;
    config.playbackConf = {
      direction: settings[0],
      unit: settings[1],
      step: settings[2],
    };
  }
};

// Default viewing location: Colombo, Sri Lanka
let myLat = 6.9;
let myLon = 79.9;

// Attempt to set actual location data if allowed by user
navigator.geolocation.getCurrentPosition((pos) => {
  myLat = pos.coords.latitude;
  myLon = pos.coords.longitude;
});

const PLAYBACK_TYPES = { STATIC: "STATIC", LIVE: "LIVE", CONF: "CONF" };

function setup() {
  config = {
    playbackType: PLAYBACK_TYPES.CONF,
    playbackConf: {
      direction: "add",
      unit: "d",
      step: 1,
    },
    scale: 2,
    backgroundColor: color("#202633"),
    darkHighlight: color("#1e222d"),
    foregroundColor: color("#2f3c3d"),
    foregroundHighlight: color("#116066"),
    foregroundHighlight2: color("#3c5658"),
    moonShadow: color("#5e4841"),
    planets: {
      Su: {
        char: "☉",
        size: 0.4,
        color: color("#ffc107"),
        eqDistMultiplier: 25,
      },
      Mo: {
        char: "☽",
        size: 0.35,
        color: color("#bdbdbd"),
        eqDistMultiplier: 25,
      },
      Me: {
        char: "☿",
        size: 0.2,
        color: color("#00bcd4"),
        eqDistMultiplier: 25,
      },
      Ve: {
        char: "♀",
        size: 0.25,
        color: color("#f46dab"),
        eqDistMultiplier: 25,
      },
      Ma: {
        char: "♂",
        size: 0.28,
        color: color("#e91e63"),
        eqDistMultiplier: 15,
      },
      Ju: {
        char: "♃",
        size: 0.32,
        color: color("#673ab7"),
        eqDistMultiplier: 5,
      },
      Sa: {
        char: "♄",
        size: 0.3,
        color: color("#05cd6a"),
        eqDistMultiplier: 3,
      },
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

const constructLocString = (degrees, type) => {
  if (degrees >= 0) {
    indicator = type === "lat" ? "N" : "E";
  } else {
    indicator = type === "lat" ? "S" : "W";
    degrees = degrees * -1;
  }
  const wholeDegrees = Math.floor(degrees);
  return `${wholeDegrees}${indicator}${degrees % 1}`;
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

const getResolvedPlanetData = (planet, planetConfig, scale, asc) => ({
  size: planetConfig.size * 20 * scale * scale,
  color: planetConfig.color,
  posX: 0,
  posY: 140 * scale,
  rotation: (planet.ra - asc.ra) % 360,
  eqDist: planet.geoCentricCoords
    ? planet.geoCentricCoords.y * planetConfig.eqDistMultiplier * scale
    : 0,
});

function draw() {
  const {
    playbackType,
    playbackConf: { direction, unit, step },
    scale,
    backgroundColor,
    zodiac: zodiacConfig,
    planets: planetsConfig,
    moonShadow,
    darkHighlight,
    foregroundColor,
    foregroundHighlight,
    foregroundHighlight2,
  } = config;

  // Set playback related configs
  switch (playbackType) {
    case PLAYBACK_TYPES.LIVE:
      datetime = moment();
      break;
    case PLAYBACK_TYPES.CONF:
      datetime = datetime[direction](step, unit);
      break;
  }

  // Get planetary data from external library
  const date = datetime.format("YYYY/MM/DD");
  const time = datetime.format("HH:mm");
  const { positions, moonPhase } = get_positions(
    date,
    time,
    moment.duration(moment.duration(myTzOffset, "minutes")).asHours(),
    constructLocString(myLat, "lat"),
    constructLocString(myLon, "lon")
  );

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

  // Initiate main drawing
  background(backgroundColor);
  textSize(12 * scale);
  translate(width / 2, height / 2);

  // Display time and date
  fill(foregroundHighlight2);
  stroke(foregroundHighlight2);
  strokeWeight(1 * scale);
  text(`${date}`, -28 * scale, 16 * scale);
  text(`${time}`, -16 * scale, -10 * scale);

  // Draw eastern marker
  fill(foregroundHighlight);
  stroke(foregroundHighlight);
  strokeWeight(1 * scale);
  text("E", 80 * scale, -12 * scale);
  strokeWeight(2 * scale);
  line(0, 0, 95 * scale, 0);

  // Draw western marker
  fill(foregroundColor);
  stroke(foregroundColor);
  strokeWeight(1 * scale);
  text("W", -86 * scale, -12 * scale);
  strokeWeight(2 * scale);
  line(0, 0, -95 * scale, 0);

  // Display zodiac wheel
  noFill();
  strokeWeight(100 * scale);
  stroke(darkHighlight);
  ellipse(0, 0, 300 * scale, 300 * scale);

  // Draw each constellation with name and border
  zodiac.forEach((constellation, index) => {
    push();
    rotate(-90);
    rotate((index * 30 - asc.degree) % 360);

    // Draw constellation borders
    stroke(index <= 1 ? foregroundHighlight : foregroundColor);
    strokeWeight(2 * scale);
    line(0, 110 * scale, 0, 194 * scale);

    // Draw constellation name
    push();
    noStroke();
    fill(index === 0 ? foregroundHighlight : foregroundColor);
    translate(-35 * scale, 180 * scale);
    rotate(196);
    text(constellation.shortName, 0, 0);
    pop();

    pop();
  });

  // Draw planet shadows
  push();
  rotate(-90);
  fill(18);
  stroke(18);
  strokeWeight(2 * scale);
  planets.forEach((planet) => {
    const planetConfig = planetsConfig[planet.name];
    if (!planetConfig) return;

    const { size, posX, posY, rotation, eqDist } = getResolvedPlanetData(
      planet,
      planetConfig,
      scale,
      asc
    );

    rotate(rotation);
    ellipse(posX + 2, posY + eqDist + 2 * scale, size * 1.1, size * 1.1);
    rotate(-rotation);
  });
  pop();

  // Draw sunrise markers
  stroke(foregroundHighlight);
  strokeWeight(2 * scale);
  line(130 * scale, -5 * scale, 130 * scale, 5 * scale);
  line(150 * scale, -5 * scale, 150 * scale, 5 * scale);
  strokeWeight(1 * scale);
  line(106 * scale, -4 * scale, 106 * scale, 4 * scale);
  line(175 * scale, -4 * scale, 175 * scale, 4 * scale);

  // Draw planets
  push();
  rotate(-90);
  stroke(18);
  strokeWeight(2 * scale);
  planets.forEach((planet) => {
    const planetConfig = planetsConfig[planet.name];
    if (!planetConfig) return;

    const { size, color, posX, posY, rotation, eqDist } = getResolvedPlanetData(
      planet,
      planetConfig,
      scale,
      asc
    );

    rotate(rotation);
    if (planet.name === "Mo") {
      drawMoon(posX, posY, size, color, moonPhase, moonShadow);
    } else {
      fill(color);
      ellipse(posX, posY + eqDist, size, size);
    }
    rotate(-rotation);
  });
  pop();
}
