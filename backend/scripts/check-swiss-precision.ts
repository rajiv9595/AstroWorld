async function checkSwiss() {
  try {
    const swisseph = await import('@swisseph/node');
    console.log('Swiss Ephemeris is available:', typeof swisseph);
    swisseph.setSiderealMode(swisseph.SiderealMode.Lahiri);
    const dateUtc = new Date('2005-08-16T18:32:00.000Z');
    const jd = swisseph.dateToJulianDay(dateUtc);
    const ayan = swisseph.getAyanamsaExUt(jd, swisseph.CalculationFlag.SwissEphemeris | swisseph.CalculationFlag.NoNutation);
    const ayanNut = swisseph.getAyanamsaExUt(jd, swisseph.CalculationFlag.SwissEphemeris);
    console.log('Swiss Ayanamsha (no nutation):', ayan);
    console.log('Swiss Ayanamsha (with nutation):', ayanNut);

    const flags = swisseph.CalculationFlag.SwissEphemeris | swisseph.CalculationFlag.Speed | swisseph.CalculationFlag.Sidereal | swisseph.CalculationFlag.NoNutation;
    const sun = swisseph.calculatePosition(jd, swisseph.Planet.Sun, flags);
    const moon = swisseph.calculatePosition(jd, swisseph.Planet.Moon, flags);
    const mars = swisseph.calculatePosition(jd, swisseph.Planet.Mars, flags);
    console.log('Swiss Sun sidereal:', sun.longitude);
    console.log('Swiss Moon sidereal:', moon.longitude);
    console.log('Swiss Mars sidereal:', mars.longitude);

    const houses = swisseph.calculateHouses(jd, 16.93407, 81.95522, swisseph.HouseSystem.Placidus);
    console.log('Swiss Ascendant tropical:', houses.ascendant);
    console.log('Swiss Ascendant sidereal (houses.asc - ayanNut):', houses.ascendant - ayanNut);
    console.log('Swiss Ascendant sidereal (houses.asc - ayan):', houses.ascendant - ayan);
  } catch (e) {
    console.log('Swiss Ephemeris import/run error:', e);
  }
}
checkSwiss();
