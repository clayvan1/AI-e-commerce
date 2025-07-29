const scrollbarStyle = `
  ::-webkit-scrollbar {
    width: 6px;
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  @media (min-width: 1024px) {
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`
export default scrollbarStyle
