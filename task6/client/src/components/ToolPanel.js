import React from 'react';

const ToolPanel = ({ error }) => {
    return (
        <div>
            <h2>Create Board</h2>
            <input
                type="text"
                placeholder="Enter board name" required
            />
            <p style={{ color: "red", marginBottom: 10 }}>{error}</p>
            <button>Create</button>
        </div>
    );
};

export default ToolPanel;
