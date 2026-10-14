/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Option2Experience } from './components/option2/Option2Experience';
import { Option1Experience } from './components/option1/Option1Experience';

export default function App() {
  // Option 02 is our primary reimagined design exploration; Option 01 is preserved for client comparison
  const [activeOption, setActiveOption] = useState<'option1' | 'option2'>('option2');

  return (
    <div className="min-h-screen bg-white">
      {activeOption === 'option2' ? (
        <Option2Experience onSwitchToOption1={() => setActiveOption('option1')} />
      ) : (
        <Option1Experience onSwitchToOption2={() => setActiveOption('option2')} />
      )}
    </div>
  );
}
