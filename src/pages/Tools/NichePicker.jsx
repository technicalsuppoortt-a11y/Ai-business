import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getNiches, seedNiches } from '../../services/nicheService';
import './NichePicker.css';

export default function NichePicker() {
  const { state, dispatch } = useApp();
  const [niches, setNiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let data = await getNiches();
      if (data.length < 6) {
        // Ensure we have all 6 niches
        await seedNiches();
        data = await getNiches();
      }
      setNiches(data);
      setLoading(false);
      
      // If there's a niche in state, set it as selected
      if (state.niche) {
        const found = data.find(n => n.id === state.niche);
        if (found) setSelectedNiche(found);
      }
    };
    fetchData();
  }, [state.niche]);

  const handleSelect = (niche) => {
    setSelectedNiche(niche);
    dispatch({ type: 'SET_FIELD', field: 'niche', value: niche.id });
  };

  const handleSubNicheSelect = (subNiche) => {
    dispatch({ type: 'SET_FIELD', field: 'subNiche', value: subNiche });
  };

  if (loading) return <div className="niche-loading">جاري تحميل المجالات...</div>;

  return (
    <div className="niche-picker-wrapper">
      <div className="niche-grid">
        {niches.map((n) => (
          <div 
            key={n.id} 
            className={`niche-card ${selectedNiche?.id === n.id ? 'active' : ''}`}
            onClick={() => handleSelect(n)}
          >
            <div className="niche-icon">{n.icon}</div>
            <h3>{n.label}</h3>
            <p>{n.id === 'ai' ? 'الأعلى طلباً' : n.id === 'business' ? 'الأعلى ربحية' : 'الأسرع انتشاراً'}</p>
          </div>
        ))}
      </div>

      {selectedNiche && (
        <div className="niche-details-container animate-slide-up">
          <div className="details-header">
            <h2>تحليل مجال {selectedNiche.label}</h2>
          </div>
          
          <div className="details-content">
            <div className="advantages-section">
              <h4>🎯 لماذا تختار هذا المجال؟</h4>
              <ul>
                {selectedNiche.advantages.map((adv, i) => (
                  <li key={i}><span>•</span> {adv}</li>
                ))}
              </ul>
            </div>

            <div className="ideas-section">
              <h4>💡 أهم الأفكار المربحة:</h4>
              <div className="ideas-grid">
                {selectedNiche.ideas.map((idea, i) => (
                  <button 
                    key={i} 
                    className={`sub-niche-btn ${state.subNiche === idea ? 'selected' : ''}`}
                    onClick={() => handleSubNicheSelect(idea)}
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="selection-summary">
            <div className="summary-text">
              النيش المختار: <strong>{selectedNiche.label}</strong>
              {state.subNiche && <span> » التخصص: <strong>{state.subNiche}</strong></span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
