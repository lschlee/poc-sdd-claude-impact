import React from 'react';

const MapContainer = ({ children }: { children?: React.ReactNode }) =>
  React.createElement('div', { 'data-testid': 'map-container' }, children);
const TileLayer = () => null;
const Marker = ({ children }: { children?: React.ReactNode }) =>
  React.createElement('div', { 'data-testid': 'marker' }, children);
const Popup = ({ children }: { children?: React.ReactNode }) =>
  React.createElement('div', { 'data-testid': 'popup' }, children);
const useMap = () => ({ setView: jest.fn(), setZoom: jest.fn() });

export { MapContainer, TileLayer, Marker, Popup, useMap };
