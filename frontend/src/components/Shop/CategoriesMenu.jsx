import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import this
import { getAllCategories } from '../../services/superadmin/productService';
import InfiniteMenu from './InfiniteMenu';

const CategoriesMenu = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); // ✅ create navigate function

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        const mapped = res.data.map((cat) => ({
          title: cat.name,
          link: `/category/${cat.id}`,
          image: cat.image_url || '/assets/default-category.jpg',
        }));
        setCategories(mapped);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    };

    fetchCategories();
  }, []);

  const handleClick = (link) => {
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(link); // ✅ navigate to internal route
    }
  };

  return (
    <div
      style={{
        height: '500px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <InfiniteMenu items={categories} onItemClick={handleClick} />
    </div>
  );
};

export default CategoriesMenu;
