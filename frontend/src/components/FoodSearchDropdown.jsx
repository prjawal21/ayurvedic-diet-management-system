import React, { useState, useMemo, useRef, useEffect } from 'react';

const FoodSearchDropdown = ({ foods, onSelect, placeholder = 'Search foods...', mealType = '' }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Filter foods based on search query and optional mealType
    const filteredFoods = useMemo(() => {
        let result = foods;
        if (mealType) {
            result = result.filter(f => f.meal_type === mealType || f.meal_type === 'All' || f.meal_type === 'Snack');
        }
        if (search.trim()) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(f => f.name.toLowerCase().includes(lowerSearch));
        }
        return result;
    }, [foods, search, mealType]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (foodId) => {
        onSelect(foodId);
        setSearch('');
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <input
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px dashed #B0CCCC',
                    background: '#F8FBFB',
                    fontSize: '13px',
                    color: '#36565F',
                    outline: 'none',
                    boxSizing: 'border-box'
                }}
            />
            
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: '#fff',
                    border: '1px solid #D0E4E8',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}>
                    {filteredFoods.length === 0 ? (
                        <div style={{ padding: '10px 12px', fontSize: '13px', color: '#93b4bc', fontStyle: 'italic' }}>
                            No foods found.
                        </div>
                    ) : (
                        filteredFoods.map(food => (
                            <div
                                key={food._id}
                                onClick={() => handleSelect(food._id)}
                                style={{
                                    padding: '10px 12px',
                                    fontSize: '13px',
                                    color: '#36565F',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #EEF5F5'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#F5FAFA'}
                                onMouseLeave={(e) => e.target.style.background = '#fff'}
                            >
                                {food.name} <span style={{ color: '#93B4BC', fontSize: '11px' }}>({food.meal_type})</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FoodSearchDropdown;
