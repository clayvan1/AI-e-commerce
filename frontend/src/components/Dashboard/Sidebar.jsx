// src/components/Dashboard/Sidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { MdOutlineCancel, MdInventory2 } from 'react-icons/md';
import { IoPlanet } from 'react-icons/io5';
import { HiUsers } from 'react-icons/hi2';
import { FaShopify } from 'react-icons/fa';
import { useStateContext } from '../../contexts/ContextProvider';
import './Sidebar.css';
import { GiArtificialHive } from "react-icons/gi";
const Sidebar = () => {
  const { activeMenu, setActiveMenu, currentColor, screenSize, userRole } = useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu && screenSize <= 900) setActiveMenu(false);
  };

  const activeLinkStyle = (isActive) => ({
    backgroundColor: isActive ? currentColor : '',
    color: isActive ? 'white' : '',
  });

  const linksByRole = {
    superadmin: [
      {
        title: 'Main',
        links: [
          { name: 'superadmin', label: 'Dashboard', icon: <FaShopify /> },
          { name: 'superadmin/inventory', label: 'Inventory', icon: <MdInventory2 /> },
          
          { name: 'superadmin/users', label: 'Users', icon: <HiUsers /> },
          { name: 'superadmin/Agent', label: 'Agent', icon: <GiArtificialHive /> },
        ],
      },
      {
        title: 'Settings',
        links: [
          { name: 'superadmin/profile', label: 'Profile', icon: <IoPlanet /> },
          { name: 'logout', label: 'Logout', icon: <IoPlanet /> },
        ],
      },
    ],
    shopkeeper: [
      {
        title: 'Main',
        links: [
          { name: 'shopkeeper', label: 'Dashboard', icon: <FaShopify /> },
          { name: 'shopkeeper/products', label: 'My Products', icon: <SiShopware /> },
          { name: 'shopkeeper/orders', label: 'Orders', icon: <MdInventory2 /> },
          { name: 'shopkeeper/Stock', label: 'Stock', icon: <MdInventory2 /> },
          { name: 'shopkeeper/Agent', label: 'Agent', icon: <GiArtificialHive /> },
        ],
      },
      {
        title: 'Settings',
        links: [
          { name: 'shopkeeper/profile', label: 'Profile', icon: <IoPlanet /> },
          { name: 'logout', label: 'Logout', icon: <IoPlanet /> },
        ],
      },
    ],
  };

  const links = linksByRole[userRole] || [];

  return (
    <div className={`sidebar ${activeMenu ? 'show' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" onClick={handleCloseSideBar} className="logo">
          <IoPlanet /> <span>Gee Planet</span>
        </Link>
        <button className="close-btn" onClick={() => setActiveMenu(false)}>
          <MdOutlineCancel />
        </button>
      </div>

      <div className="sidebar-links">
        {links.map((section) => (
          <div key={section.title}>
            <p className="section-title">{section.title}</p>
            {section.links.map((link) => (
              <NavLink
                key={link.name}
                to={`/dashboard/${link.name}`}
                end={link.name === `${userRole}`}
                onClick={handleCloseSideBar}
                className="link"
                style={({ isActive }) => activeLinkStyle(isActive)}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
