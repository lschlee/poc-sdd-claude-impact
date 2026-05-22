const leaflet = {
  map: jest.fn(),
  tileLayer: jest.fn(),
  marker: jest.fn(),
  Icon: { Default: { mergeOptions: jest.fn() } },
  icon: jest.fn(),
  latLng: jest.fn(),
  latLngBounds: jest.fn(),
};

export default leaflet;
module.exports = leaflet;
