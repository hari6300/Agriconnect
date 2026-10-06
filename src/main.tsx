import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './LanguageContext.tsx';
import { BatteryEcoProvider } from './BatteryEcoContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BatteryEcoProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BatteryEcoProvider>
  </StrictMode>,
);

