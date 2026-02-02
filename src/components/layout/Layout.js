import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                <div className="content-container">
                    {children}
                </div>
            </main>
            <footer className="footer">
                <div className="footer-content">
                    <p>© {new Date().getFullYear()} Poll Point. Secure Voting Platform.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
