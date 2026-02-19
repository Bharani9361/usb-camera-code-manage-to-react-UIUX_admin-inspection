import React from 'react';

const FullScreenLoader = () => {
    return (
        <>
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
            <div style={styles.overlay}>
                <div style={styles.spinner}></div>
            </div>
        </>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        width: '70px',
        height: '70px',
        border: '6px solid rgba(100, 100, 100, 0.3)',
        borderTop: '6px solid #00bfff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        boxShadow: '0 0 12px rgba(0, 191, 255, 0.6)',
    },
};

export default FullScreenLoader;
