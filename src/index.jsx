import { createRoot } from "react-dom/client";
import { SpSpa } from "pankosmia-rcl";
import App from "./App";
import './index.css';

createRoot(document.getElementById("root"))
    .render(
        <SpSpa
            requireNet={false}
            titleKey="pages:core-dashboard:title"
            currentId="core-dashboard"
        >
            <App />
        </SpSpa>
    );
