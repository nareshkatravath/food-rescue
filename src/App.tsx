/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FoodRescueProvider } from './context/FoodRescueContext';
import { AndroidFrame } from './components/AndroidFrame';

export default function App() {
  return (
    <FoodRescueProvider>
      <AndroidFrame />
    </FoodRescueProvider>
  );
}
