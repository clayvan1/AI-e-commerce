// src/components/Dashboard/Navbar.jsx
import React, { useEffect } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { FiShoppingCart } from 'react-icons/fi';
import { BsChatLeft } from 'react-icons/bs';
import { RiNotification3Line } from 'react-icons/ri';
import { MdKeyboardArrowDown, MdOutlineCancel } from 'react-icons/md';

import Button from './Button';
import { chatData } from '../../data/dummy';
import avatar from '../../data/avatar.jpg';

import Chat from './Chat';
import UserProfile from './UserProfile';

import { useStateContext } from '../../contexts/ContextProvider';
import './Navbar.css';

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <button
    type="button"
    title={title}
    onClick={customFunc}
    style={{ color }}
    className="nav-button"
  >
    {dotColor && (
      <span
        style={{ backgroundColor: dotColor }}
        className="nav-button-dot"
      />
    )}
    {icon}
  </button>
);

const Notification = ({ onClose }) => {
  const { currentColor } = useStateContext();

  return (
    <div className="nav-item notification-dropdown">
      <div className="header">
        <p>Notifications</p>
        <button type="button" className="new-button">5 New</button>
        <Button
          icon={<MdOutlineCancel />}
          color="rgb(153, 171, 180)"
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
          customFunc={onClose}
        />
      </div>

      <div className="notifications-list">
        {chatData?.map((item, index) => (
          <div
            key={index}
            className="notification-item"
          >
            <img className="rounded-full" src={item.image} alt={item.message} />
            <div>
              <p className="font-semibold">{item.message}</p>
              <p className="text-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        style={{ backgroundColor: currentColor }}
        className="footer-btn"
      >
        See all notifications
      </button>
    </div>
  );
};

const Navbar = () => {
  const {
    currentColor,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setIsClicked,
    setScreenSize,
    screenSize,
  } = useStateContext();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setScreenSize]);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize, setActiveMenu]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  // Close dropdown handler
  const closeDropdown = (dropdown) => {
    setIsClicked((prev) => ({ ...prev, [dropdown]: false }));
  };

  return (
    <div className="navbar-container">
      <NavButton
        title="Menu"
        customFunc={handleActiveMenu}
        color={currentColor}
        icon={<AiOutlineMenu />}
      />

      <div className="navbar-right">
        
        <NavButton
          title="Chat"
          dotColor="#03C9D7"
          customFunc={() => handleClick('chat')}
          color={currentColor}
          icon={<BsChatLeft />}
        />
        <NavButton
          title="Notification"
          dotColor="rgb(254, 201, 15)"
          customFunc={() => handleClick('notification')}
          color={currentColor}
          icon={<RiNotification3Line />}
        />

        <div
          className="profile-container"
          title="Profile"
          onClick={() => handleClick('userProfile')}
        >
          <img className="profile-avatar" src={avatar} alt="user-profile" />
          <p>
            <span className="profile-hi">Hi,</span>{' '}
            <span className="profile-name">Michael</span>
          </p>
          <MdKeyboardArrowDown className="profile-arrow" />
        </div>

        {/* Dropdowns */}
        {isClicked.cart && <Cart onClose={() => closeDropdown('cart')} />}
        {isClicked.chat && <Chat onClose={() => closeDropdown('chat')} />}
        {isClicked.notification && <Notification onClose={() => closeDropdown('notification')} />}
        {isClicked.userProfile && <UserProfile onClose={() => closeDropdown('userProfile')} />}
      </div>
    </div>
  );
};

export default Navbar;
