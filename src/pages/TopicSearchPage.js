import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function TopicSearchPage() {
  const [topic, setTopic] = useState(''); // 검색 주제 저장
  const [results, setResults] = useState([]); // 검색 결과 저장
  const [sentimentCounts, setSentimentCounts] = useState({ 긍정: 0, 부정: 0, 중립: 0 }); // 감정 결과 카운트
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  // const [showAllNews, setShowAllNews] = useState(false); // 전체 뉴스 보기 상태
  const [filter, setFilter] = useState('전체'); // 필터링 상태

  const handleSearch = async () => {
    if (!topic.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    // 기존 결과 초기화
    setResults([]);
    setSentimentCounts({ 긍정: 0, 부정: 0, 중립: 0 });
    setError(null);
    setLoading(true);

    try {
      // 백엔드 API 호출
      const response = await fetch('https://search-be-t5xp.onrender.com/topic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error('데이터를 불러오는 중 오류가 발생했습니다.');
      }

      const data = await response.json();

      // 감정 분석 결과 카운트 계산
      const counts = data.news.reduce((acc, item) => {
        acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
        return acc;
      }, {});

      // 상태 업데이트
      setResults(data.news);
      setSentimentCounts({
        긍정: counts['긍정'] || 0,
        부정: counts['부정'] || 0,
        중립: counts['중립'] || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setTopic(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // const toggleShowAllNews = () => {
  //   setShowAllNews(!showAllNews); // 클릭 시 상태 변경
  //   if (!showAllNews) setFilter('전체'); // 전체 뉴스 보기 초기화
  // };

  const positiveNews = results.filter(news => news.sentiment === '긍정').slice(0, 3);
  const neutralNews = results.filter(news => news.sentiment === '중립').slice(0, 3);
  const negativeNews = results.filter(news => news.sentiment === '부정').slice(0, 3);

  const filteredNews = filter === '전체'
    ? results
    : results.filter(news => news.sentiment === filter);

  const chartData = { // 긍정, 부정, 중립 데이터 정의
    labels: ['긍정', '부정', '중립'],
    datasets: [{
      data: [sentimentCounts.긍정, sentimentCounts.부정, sentimentCounts.중립],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      hoverOffset: 30,
    }],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white'  // ✅ 여기 추가: 라벨 글씨를 흰색
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value}개 (${percentage}%)`;
          },
        },
      },
    },
    hover: { mode: 'nearest', intersect: true },
    layout: { padding: 20 },
  };

  return (
    <div style={{ padding: '20px' }}>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '450px',
        marginTop: '40px',
      }}>
        <input
          type="text"
          placeholder="Enter Keywords"
          value={topic}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={{
            padding: '10px 15px',
            width: '250px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '7px',
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 20px',
            marginLeft: '10px',
            backgroundColor: 'tan',
            color: 'black',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>


      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && results.length > 0 && (
        <>
          <div style={{
            maxWidth: '350px',
            margin: '20px auto',
          }}>
            <h3 style={{
              textAlign: 'center',
              marginBottom: '10px',
              color: 'white',
              backgroundColor: '#444444', // 어두운 회색 ~ 검정
              padding: '10px',
              borderRadius: '9px'
            }}>
              Sentiment Analysis
            </h3>
            <Pie data={chartData} options={chartOptions} />
          </div>

          {/* 라벨과 뉴스 섹션 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '20px',
          }}>
            {/* 긍정 섹션 */}
            <div style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '50px',
              backgroundColor: '#333',
              margin: '0 10px',
              color: 'white',
              textAlign: 'center'
            }}>
              {/* ✅ 이미지 추가 */}
              <img
                src="/1.png" // 또는 외부 이미지 URL 가능
                alt="긍정 이미지"
                style={{ width: '200px', height: '200px', objectFit: 'contain', marginBottom: '10px' }}
              />
              {/* ✅ 가운데 정렬을 보장하는 래퍼 div 추가 */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '35px',
                  backgroundColor: '#444',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  Positive
                </h3>
              </div>

              {positiveNews.map((news, index) => (
                <div key={index} style={{
                  marginBottom: '10px',
                  textAlign: 'left'  // ✅ 왼쪽 정렬 추가
                }}>
                  <h4>
                    <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#36A2EB' }}>
                      {news.title}
                    </a>
                  </h4>
                  <p>{news.content_summarized}</p>
                </div>
              ))}
            </div>

            {/* 중립 섹션 */}
            <div style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '50px',
              backgroundColor: '#333',
              margin: '0 10px',
              color: 'white',
              textAlign: 'center'
            }}>
              {/* ✅ 이미지 추가 */}
              <img
                src="/2.png" // 또는 외부 이미지 URL 가능
                alt="중립 이미지"
                style={{ width: '200px', height: '200px', objectFit: 'contain', marginBottom: '10px' }}
              />
              {/* ✅ 가운데 정렬을 보장하는 래퍼 div 추가 */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '35px',
                  backgroundColor: '#444',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  Neutral
                </h3>
              </div>
              {neutralNews.map((news, index) => (
                <div key={index} style={{
                  marginBottom: '10px',
                  textAlign: 'left'  // ✅ 왼쪽 정렬 추가
                }}>
                  <h4>
                    <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#FFCE56' }}>
                      {news.title}
                    </a>
                  </h4>
                  <p>{news.content_summarized}</p>
                </div>
              ))}

            </div>

            {/* 부정 섹션 */}
            <div style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '50px',
              backgroundColor: '#333',
              margin: '0 10px',
              color: 'white',
              textAlign: 'center'
            }}>
              {/* ✅ 이미지 추가 */}
              <img
                src="/3.png" // 또는 외부 이미지 URL 가능
                alt="부정 이미지"
                style={{ width: '200px', height: '200px', objectFit: 'contain', marginBottom: '10px' }}
              />
              {/* ✅ 가운데 정렬을 보장하는 래퍼 div 추가 */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '35px',
                  backgroundColor: '#444',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  Negative
                </h3>
              </div>

              {negativeNews.map((news, index) => (
                <div key={index} style={{
                  marginBottom: '10px',
                  textAlign: 'left'  // ✅ 왼쪽 정렬 추가
                }}>
                  <h4>
                    <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#FF6384' }}>
                      {news.title}
                    </a>
                  </h4>
                  <p>{news.content_summarized}</p>
                </div>
              ))}

            </div>
          </div>

          {/* 전체 뉴스 보기 버튼
          <div style={{ marginTop: '100px', textAlign: 'center' }}>
            <button
              onClick={toggleShowAllNews}
              style={{
                padding: '10px 20px',
                backgroundColor: 'tan',
                color: 'white',
                border: 'none',
                borderRadius: '7px',
                cursor: 'pointer',
              }}
            >
              {showAllNews ? '전체 뉴스 닫기' : '전체 뉴스 보기'}
            </button>
          </div> */}


          {/* 전체 뉴스 섹션 */}
          <div style={{
            marginTop: '20px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
            maxHeight: '2800px',
            overflowY: 'scroll',
          }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>전체 뉴스</h3>

            {/* 필터 버튼 */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              {['전체', '긍정', '부정', '중립'].map(label => (
                <button
                  key={label}
                  onClick={() => setFilter(label)}
                  style={{
                    padding: '10px 20px',
                    margin: '0 10px',
                    backgroundColor: label === filter ? 'tan' : '#ddd',
                    color: label === filter ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 필터된 뉴스 목록 */}
            {filteredNews.map((news, index) => (
              <div key={index} style={{
                marginBottom: '10px',
                padding: '10px',
                borderBottom: '1px solid #eee',
              }}>
                <h4>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'black' }}
                  >
                    {news.title}
                  </a>
                </h4>
                <p>{news.content_summarized}</p>
                <span style={{
                  color: news.sentiment === '긍정' ? 'blue'
                    : news.sentiment === '부정' ? 'red' : 'orange',
                }}>
                  {news.sentiment}
                </span>
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
}

export default TopicSearchPage;
