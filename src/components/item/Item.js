import React, { useEffect, useState, useCallback } from "react";
import "./Item.css";
import StockList from "./Stock/StockList.js";
import InOutInfo from "./InOutInfo/InOutInfo.js";
import Perchase from "./Purchase.js";
import AddStock from './Stock/AddStock.js';
import ModifyStock from './Stock/ModifyStock.js';
import Pagination from "../layout/Pagination.js";

const Item = () => {
  const [items, setItems] = useState([]);
  const [view, setView] = useState("productList");
  const [pageInfo, setPageInfo] = useState({});
  const [selectedItem, setSelectedItem] = useState(null); // 선택된 상품 정보
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPerchaseModalOpen, setIsPerchaseModalOpen] = useState(false); // Perchase 모달 상태
  



  useEffect(() => {
    const userNum = localStorage.getItem("userNum");
    setIsLoggedIn(!!userNum); // user_num이 있으면 true, 없으면 false
  }, []);

  const [filters, setFilters] = useState({
    pageNum: 1,
    order: 0,
    category: "",
    keyfield: "",
    keyword: "",
  });

  // 상품 클릭 시 Perchase 모달 열기
  const handleItemClick = (item) => {
    if (!isLoggedIn) {
      alert("로그인 후 상품을 구매할 수 있습니다.");
      return; // 로그인되지 않았다면 실행 중단
    }

    setSelectedItem(item);
    setIsPerchaseModalOpen(true); // Perchase 모달 열기
  };

  const closeModal = () => {
    setIsPerchaseModalOpen(false);
    setSelectedItem(null); // selectedItem 초기화
  };
  

  const fetchItems = useCallback(async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(
        `https://n0b85a7897a3e9c3213c819af9d418042.apppaas.app/item/list?${query}`
      );
      if (!response.ok) {
        throw new Error("데이터를 가져오는 중 오류가 발생했습니다.");
      }
      const data = await response.json();
      setItems(data.items);
      setPageInfo({ count: data.count });
    } catch (error) {
      console.error("에러 발생:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleButtonClick = (viewName) => {
    if (viewName === "modifyStock" && !selectedItem) {
      // selectedItem이 없으면 ModifyStock으로 이동하지 않음
      alert("수정할 항목을 선택해주세요.");
      return;
    }
    
    setView(viewName);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    const keyfield = e.target.keyfield.value;
    const keyword = e.target.keyword.value;

    setFilters((prev) => ({
      ...prev,
      keyfield,
      keyword,
      pageNum: 1,
    }));
  };



  const handleOrderChange = (order) => {
    setFilters((prev) => ({ ...prev, order, pageNum: 1 }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };



  const handleModifyItem = (modifiedItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.itemNum === modifiedItem.itemNum ? modifiedItem : item
      )
    );
    setView("stockList"); // 수정 후 제품 목록으로 돌아가기
  };

  return (
    <div className="container">
      <div className="same-line">
        <div className="button-group-left">
          <button
            onClick={() => handleButtonClick("productList")}
            className={view === "productList" ? "selected" : ""}
          >
            제품리스트
          </button>
          <button
            onClick={() => handleButtonClick("stockList")}
            className={view === "stockList" ? "selected" : ""}
          >
            재고리스트
          </button>
          <button
            onClick={() => handleButtonClick("inOutInfo")}
            className={view === "inOutInfo" ? "selected" : ""}
          >
            입출고정보
          </button>
        </div>
        <div className="button-group-right">
          {view === "stockList" && (
            <>
              <button
                onClick={() => handleButtonClick("addStock")} // 등록 버튼 클릭 시 AddStock view로 변경
                className={view === "addStock" ? "selected" : ""}
              >
                등록
              </button>
              <button
                onClick={() => handleButtonClick("modifyStock")} // 수정 버튼 클릭 시 ModifyStock view로 변경
                className={view === "modifyStock" ? "selected" : ""}
              >
                수정
              </button>
            </>
          )}
        </div>
      </div>

      {view === "productList" && (
        <>
                  <div className="form-container">
            <form onSubmit={handleSearch} className="search-form">
              <select name="keyfield">
                <option value="0">선택</option>
                <option value="1">번호</option>
                <option value="2">이름</option>
                <option value="3">카테고리</option>
              </select>
              <input name="keyword" placeholder="검색어 입력" />
              <button type="submit">검색</button>
            </form>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>제품코드</th>
                <th>제품명</th>
                <th>카테고리</th>
                <th>가격</th>
                <th>수량</th>
                <th>업데이트 날짜</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {pageInfo.count > 0 ? (
                items.map((item, index) => (
                  <tr key={index} onClick={() => handleItemClick(item)} className="canPerchase">
                    <td>{item.itemNum}</td>
                    <td>{item.itemName}</td>
                    <td>{item.categoryName}</td>
                    <td className="text-right">
                      {item.price.toLocaleString()} 원
                    </td>
                    <td>{item.itemQuantity}</td>
                    <td>{formatDate(item.itemUptDate)}</td>
                    <td>{item.itemNotes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-message">
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="order-radio">
            <label>
              <input
                type="radio"
                name="order"
                value="1"
                onChange={() => handleOrderChange(1)}
                checked={filters.order === 1}
              />
              가격 낮은순
            </label>
            <label>
              <input
                type="radio"
                name="order"
                value="2"
                onChange={() => handleOrderChange(2)}
                checked={filters.order === 2}
              />
              가격 높은순
            </label>
            <label>
              <input
                type="radio"
                name="order"
                value="3"
                onChange={() => handleOrderChange(3)}
                checked={filters.order === 3}
              />
              수량 많은순
            </label>
            <label>
              <input
                type="radio"
                name="order"
                value="4"
                onChange={() => handleOrderChange(4)}
                checked={filters.order === 4}
              />
              수량 적은순
            </label>
          </div>

          {/* Pagination 컴포넌트 추가 */}
          {pageInfo.count > 0 && (
                <Pagination
                  currentPage={filters.pageNum}
                  count={pageInfo.count}
                  setFilters={setFilters}
                />
              )}
        </>
      )}

      {view === "stockList" && (
        <div>
          <StockList setView={setView} setSelectedItem={setSelectedItem} selectedItem={selectedItem}/>
        </div>
      )}

      {view === "inOutInfo" && (
        <div>
          <InOutInfo />
        </div>
      )}

      {/* AddStock */}
      {view === "addStock" && (
        <AddStock setView={setView} /> // AddStock 컴포넌트에 setView 전달
      )}

      {/* ModifyStock */}
      {view === "modifyStock" && (
        <ModifyStock selectedItem={selectedItem} onModify={handleModifyItem} setView={setView}/>
      )}

      {/* Perchase 모달창 */}
      {isPerchaseModalOpen && selectedItem && (
        <Perchase
          item={selectedItem} closeModal ={closeModal}
          onClose={() => setIsPerchaseModalOpen(false)} // 모달 닫기
        />
      )}
    </div>
  );
};

export default Item;
