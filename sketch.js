let config;
let tick = 0;
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
        color: color("#f57b42"),
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
        color: color("#05cd6a"),
        eqDistMultiplier: 25,
      },
      Ve: {
        char: "♀",
        size: 0.25,
        color: color("#ffb5fb"),
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
        color: color("#ffc107"),
        eqDistMultiplier: 5,
      },
      Sa: {
        char: "♄",
        size: 0.3,
        color: color("#673ab7"),
        eqDistMultiplier: 3,
      },
      Ra: {
        char: "",
        size: 0.2,
        color: color("#232661"),
        eqDistMultiplier: 25,
      },
      Ke: {
        char: "♄",
        size: 0.2,
        color: color("#4f5178"),
        eqDistMultiplier: 25,
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
    updateInterval: 1,
  };
  createCanvas(windowWidth, windowHeight - 50);
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
    console.error("Moon phase cannot be determined. Received: [", phaseString + "]");
    return 15;
  }
  const split = phaseString.split("/");
  return parseInt(split[0]) + (split[1][0] === "K" ? 0 : 15);
};

const drawMoon = (posX, posY, size, color, moonPhase, moonShadow) => {
  const moonPhaseIndex = extractMoonPhaseIndex(moonPhase);
  const firstHalf = moonPhaseIndex <= 15;
  noStroke();
  angleMode(RADIANS);

  a = map(moonPhaseIndex, 1, 30, 0, -Math.PI * 2);
  a %= -Math.PI * 2;

  let color1 = color;
  let color2 = color;
  let color3 = color;
  let color4 = color;

    if (-Math.PI / 2 < a && a < 0) {
      color1 = moonShadow;
      color2 = color;
      color3 = color;
      color4 = color;
    } else if (-Math.PI < a && a < -Math.PI / 2) {
      color1 = moonShadow;
      color2 = color;
      color3 = moonShadow;
      color4 = moonShadow;
    } else if ((-3 * Math.PI) / 2 < a && a < -Math.PI) {
      color1 = color;
      color2 = moonShadow;
      color3 = moonShadow;
      color4 = moonShadow;
    } else if (-2 * Math.PI < a && a < (-3 * Math.PI) / 2) {
      color1 = color;
      color2 = moonShadow;
      color3 = color;
      color4 = color;
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
  rotation: (-planet.ra + asc.ra + 30) % 360,
  eqDist: planet.geoCentricCoords
    ? planet.geoCentricCoords.y * planetConfig.eqDistMultiplier * scale
    : 0,
});

function evaluateHouse(house, sign, localPlanets, allPlanets) {
  
  let houseKeywords = [
    ['Self', 'Personality', 'Outlook on life', 'Outward behavior', 'Self-awareness', 'Self-concern', 'Persona', 'Build', 'Health', 'Appearence', 'Vitality', 'Individuality'],
    ['Possessions', 'Values', 'Resources', 'Financial security', 'Livelihood', 'Resources', 'Self-worth'],
    ['Conscious mind', 'Communications', 'Near environment', 'Short journeys', 'Early education', 'Learning style', 'Self-expression', 'Siblings', 'Neighbors', 'Ground transportation'],
    ['Roots', 'Home', 'Parents (Mother)', 'Heridity', 'Traditions', 'Subconcious', 'Places of residence', 'Real estate', 'Property', 'Conditions in early and late life'],
    ['Creativity', 'Pleasures', 'Objects of affection (children, pets, lovers)', 'Vacations', 'Hobbies', 'Games', 'Speculation', 'Talents', 'Need for attention'],
    ['Work', 'Employment', 'Co-workers or subordinates', 'Working conditions', 'Health', 'Fitness', 'Diet', 'Hygene', 'Service', 'Duties', 'Daily tasks'],
    ['Partnerships', 'Relationships', 'Marriage', 'Close associates', 'Concern for others', 'Peers', 'Agents', 'Open enemies', 'Contracts', 'Close associates', 'Negotiations', 'Lower courts'],
    ['Birth', 'Death', 'Reproduction', 'Transformation', 'Credit', 'Tax', 'Insurance', 'Joint finances', 'Investments', 'Inheritance', 'Big business', 'Sex', 'Spirituality'],
    ['Foreign environments and languages', 'Long journeys', 'The higher mind', 'Philosophy', 'Religion', 'Higher education', 'Ethics', 'Higher courts', 'Publishing', 'In-laws', 'Media', 'The Internet'],
    ['Public standing', 'Reputation', 'Status', 'Worldly attaintment', 'Ambition', 'Sense of mission', 'Profession', 'Career', 'Responsibilities', 'Authority', 'Father', 'Guardian', 'Boss'],
    ['Hopes and wishes', 'Goals', 'Ideals', 'Humanitarianism', 'Associates', 'Groups', 'Friends', 'Business contacts', 'Money made from career'],
    ['Spirituality', 'Sleep', 'Unseen or hidden causes', 'Limitations', 'Secrets', 'Fears', 'Need for withdrawal or privacy', 'Hidden enemies', 'Confinement', 'Self-undoing'],
  ];

  return {
    name: house,
    keywords: houseKeywords[house - 1],
  };
}

function evaluateSign(house, sign, localPlanets, allPlanets) {

  let signKeywords = {
    Aries: ['Enthusiastic', 'Outgoing', 'Self-centered', 'Energetic', 'Pioneering', 'Assertive'],
    Taurus: ['Stable', 'Steadfast', 'Patient', 'Practical', 'Stubborn', 'Jealous', 'Artsy'],
    Gemini: ['Communicative', 'Inquisitive', 'Adaptable', 'Versatile'],
    Cancer: ['Sensitive', 'Nurturing', 'Receptive', 'Home / Family oriented', 'Emotional'],
    Leo: ['Generous', 'Showy', 'Dramatic', 'Creative', 'A leader', 'Egotistical', 'Fun-loving'],
    Virgo: ['Analytical', 'Discriminiating', 'Critical', 'Detail-oriented', 'Service-minded', 'Useful'],
    Libra: ['Diplomatic', 'Other-oriented', 'Peace-loving', 'Refined', 'Flirty', 'Indecisive'],
    Scorpio: ['Magnetic', 'Powerful', 'Intense', 'Persevering', 'Passionate', 'Extreme'],
    Sagittarius: ['Idealistic', 'Optimistic', 'Scattered', 'Honest', 'Exaggarative', 'Restless'],
    Capricorn: ['Ambitious', 'Responsible', 'Economical', 'Efficient', 'Disciplined', 'Insensitive'],
    Aquarius: ['Impersonal', 'Detached', 'Original', 'Humanitarian', 'Independent', 'Rebellious'],
    Pisces: ['Sympathetic', 'Sentimental', 'Caring', 'Responsive', 'Psychic', 'Spiritual', 'Escapist'],
  };

  let planetKeywords = {
    Su: ['Leadership', 'Ego', 'Will power', 'Creativity', 'Vitality', 'Spirit', 'Purpose', 'Identity'],
    Mo: ['Habit patterns', 'Feelings', 'Receptivity', 'Sensitivity', 'Nurturing'],
    Me: ['Rational mind', 'Thinking processes', 'Communication', 'Local travel', 'Transportation matters'],
    Ve: ['Affections', 'Attraction', 'Aestheics', 'Desire for beauty', 'Balance', 'Values', 'Harmony'],
    Ma: ['Aggressiveness', 'Assertiveness', 'Initiative', 'Independence', 'Pioneering', 'Competition'],
    Ju: ['Growth', 'Philosophy', 'Higher education', 'Long distance travel or communication'],
    Sa: ['Structure', 'Definition', 'Limits', 'Restriction', 'Responsibility', 'Organization', 'Authority', 'Maturity'],
    Ra: ['Direction of progress', 'What is difficul to do but growth producing', 'What one needs to develop'],
    Ke: ['Path of least resistence', 'Not growth producing', 'Traps from old habits'],
  };

  let signRuler = {
    Aries: 'Ma',
    Taurus: 'Ve',
    Gemini: 'Me',
    Cancer: 'Mo',
    Leo: 'Su',
    Virgo: 'Me',
    Libra: 'Ve',
    Scorpio: 'Ma',
    Sagittarius: 'Ju',
    Capricorn: 'Sa',
    Aquarius: 'Sa',
    Pisces: 'Ju',
  };

  let planetExaltation = {
    Su: 'Aries', // 10 deg
    Mo: 'Taurus', // 3 deg
    Ju: 'Cancer', // 28 deg
    Me: 'Virgo', // 15 deg
    Sa: 'Libra', // 5 deg
    Ma: 'Capricorn', // 27 deg
    Ve: 'Pisces', // 20 deg
  };

  let planetDebilitation = {
    Su: 'Libra', // 10 deg
    Mo: 'Scorpio', // 3 deg
    Ju: 'Capricorn', // 28 deg
    Me: 'Pisces', // 15 deg
    Sa: 'Aries', // 5 deg
    Ma: 'Cancer', // 27 deg
    Ve: 'Virgo', // 20 deg
  };

  let rulingPlanet = allPlanets.find(p => p.name === signRuler[sign]);

  // 'EXALTED' is an idealized form of a planet's potential

  // Ruler being exalted -> Highest expression of a planet's energy
  // Ruler being in its own sign -> Most effective expression

  let rulerStatus = 'NORMAL';
  let isRulerPresent = false;

  if (rulingPlanet) {
    if (planetExaltation[rulingPlanet.name] === rulingPlanet.zodiac) {
      rulerStatus = 'EXALTED'
    }
    if (planetDebilitation[rulingPlanet.name] === rulingPlanet.zodiac) {
      rulerStatus = 'DEBILITATED'
    }
    if (rulingPlanet.zodiac === sign) {
      isRulerPresent = true;
    }
  }

  return {
    name: sign,
    rulerName: rulingPlanet.name,
    rulerKeywords: planetKeywords[rulingPlanet.name],
    rulerStatus,
    rulerSign: rulingPlanet.zodiac,
    rulerSignKeywords: signKeywords[rulingPlanet.zodiac],
    isRulerPresent,
    keywords: signKeywords[sign],
  };
}

function evaluatePlanets(house, sign, localPlanets, allPlanets) {

  let planetKeywords = {
    Su: ['Leadership', 'Ego', 'Will power', 'Creativity', 'Vitality', 'Spirit', 'Purpose', 'Identity'],
    Mo: ['Habit patterns', 'Feelings', 'Receptivity', 'Sensitivity', 'Nurturing'],
    Me: ['Rational mind', 'Thinking processes', 'Communication', 'Local travel', 'Transportation matters'],
    Ve: ['Affections', 'Attraction', 'Aestheics', 'Desire for beauty', 'Balance', 'Values', 'Harmony'],
    Ma: ['Aggressiveness', 'Assertiveness', 'Initiative', 'Independence', 'Pioneering', 'Competition'],
    Ju: ['Growth', 'Philosophy', 'Higher education', 'Long distance travel or communication'],
    Sa: ['Structure', 'Definition', 'Limits', 'Restriction', 'Responsibility', 'Organization', 'Authority', 'Maturity'],
    Ra: ['Direction of progress', 'What is difficul to do but growth producing', 'What one needs to develop'],
    Ke: ['Path of least resistence', 'Not growth producing', 'Traps from old habits'],
  };

  let relevantPlanetKeywords = [];

  localPlanets.forEach(p => relevantPlanetKeywords.push({
      name: p.name,
      keywords: planetKeywords[p.name]
    })
  );

  return relevantPlanetKeywords;
}

function evaluate(house, sign, localPlanets, allPlanets) {
  return {
    house: evaluateHouse(house, sign, localPlanets, allPlanets),
    sign: evaluateSign(house, sign, localPlanets, allPlanets),
    planets: evaluatePlanets(house, sign, localPlanets, allPlanets),
  };
}

function getEvaluatedKeywords(zodiac, planets) {
  return zodiac.map((z, i) => {

    let house = i + 1;
    let sign = z.name;
    let localPlanets = planets.filter(p => p.zodiac === sign);

     return evaluate(house, sign, localPlanets, planets)
  });
}

function drawWordCloud(data, scale, planetsConfig) {
  // strokeWeight(1 * scale);
  // text("Test", -250 * scale, -250 * scale);
  let str = '';

  data.forEach(h => {
    str = str.concat('House #').concat(h.house.name).concat(' represents:\n');
    str = str.concat(h.house.keywords.join(', ')).concat('\n\n');
    str = str.concat('It is occupied by ').concat(h.sign.name).concat(' who\'s Lord is ').concat(h.sign.rulerName).concat(', which expresses itself as:').concat('\n');
    str = str.concat(h.sign.rulerKeywords.join(', ')).concat('\n\n');
    str = str.concat(h.sign.rulerName).concat(' is ').concat(h.sign.rulerStatus).concat(' in ').concat(h.sign.rulerSign).concat(' which manifests its influence as:\n');
    str = str.concat(h.sign.rulerSignKeywords.join(', ')).concat('\n\n\n');
  });

  // console.log(str);
}

function generateExperimentalWordCloud(planets, zodiac, scale, planetsConfig) {
  let data = getEvaluatedKeywords(zodiac, planets);
  drawWordCloud(data, scale, planetsConfig);
}

function draw() {
  tick = tick + 1;

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
    updateInterval,
  } = config;

  // Set playback related configs
  switch (playbackType) {
    case PLAYBACK_TYPES.LIVE:
      datetime = moment();
      break;
    case PLAYBACK_TYPES.CONF:
      if (tick % updateInterval === 0) { 
        datetime = datetime[direction](step, unit);
      }
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
  text("E", -86 * scale, -12 * scale);
  strokeWeight(2 * scale);
  line(0, 0, -95 * scale, 0);

  // Draw western marker
  fill(foregroundColor);
  stroke(foregroundColor);
  strokeWeight(1 * scale);
  text("W", 80 * scale, -12 * scale);
  strokeWeight(2 * scale);
  line(0, 0, 95 * scale, 0);

  // Display zodiac wheel
  noFill();
  strokeWeight(100 * scale);
  stroke(darkHighlight);
  ellipse(0, 0, 300 * scale, 300 * scale);

  const rotation = +60;

  // Draw each constellation with name and border
  zodiac.forEach((constellation, index) => {
    push();
    rotate(rotation);
    rotate((index * -30 + asc.degree) % 360);

    // Draw constellation borders
    stroke(index === zodiac.length - 1 || index === 0 ? foregroundHighlight : foregroundColor);
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
  rotate(rotation);
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
  line(-130 * scale, -5 * scale, -130 * scale, 5 * scale);
  line(-150 * scale, -5 * scale, -150 * scale, 5 * scale);
  strokeWeight(1 * scale);
  line(-106 * scale, -4 * scale, -106 * scale, 4 * scale);
  line(-175 * scale, -4 * scale, -175 * scale, 4 * scale);

  // Experimental text
  generateExperimentalWordCloud(planets, zodiac, scale, planetsConfig);

  // Draw planets
  push();
  rotate(rotation);
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
