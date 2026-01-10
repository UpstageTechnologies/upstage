import React from "react";
import "./UpgradePopup.css";

export default function UpgradePopup({ onClose, onUpgrade }) {
  return (
    <div className="upgrade-backdrop">
      <div className="upgrade-modal">
        <h2>🚀 Upgrade Required</h2>
        <p>
          This feature is available only for <b>Premium</b> or <b>Lifetime</b> plan.
        </p>

        <div className="upgrade-actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="upgrade-btn" onClick={onUpgrade}>
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
}
