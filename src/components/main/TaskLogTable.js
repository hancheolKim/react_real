import React, { useState, useEffect } from "react";
import axios from "axios";
import './TaskLogTable.css'; // CSS 파일을 임포트합니다.

const TaskLogTable = () => {
  const [taskLogs, setTaskLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const [pageSize, setPageSize] = useState(5); // 한 페이지에 표시할 데이터 수
  const [progress, setProgress] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  
  
  const [formData, setFormData] = useState({
    logId: "",
    taskId: "",
    taskName: "",
    title: "",
    description: "",
    taskDate: "",
  });
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false); // 폼을 보이게 할지 말지 상태
  const [error, setError] = useState(""); // 에러 메시지 상태 추가
  

  // 최근 TaskLog 데이터 가져오기
  const fetchTaskLogs = async () => {
    try {
      const response = await axios.get("https://n0b85a7897a3e9c3213c819af9d418042.apppaas.app/tasklog/recent");
      setTaskLogs(response.data); // 모든 데이터를 상태에 저장
    } catch (error) {
      console.error("Failed to fetch task logs:", error);
    }
  };

  useEffect(() => {
    fetchTaskLogs();
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "taskName") {
      // 선택한 taskName에 해당하는 taskId 찾기
      const selectedTask = progress.find((item) => item.taskName === value);
      setFormData({
        ...formData,
        taskName: value,
        taskId: selectedTask ? selectedTask.taskId : "", // taskId 설정
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  // 로그 추가
  const handleAdd = async (event) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    if (user.status !== 'a') {
      alert("추가 권한이 없습니다.");
      return;
    }

    if (validateForm()) {
      try {
        await axios.post("https://n0b85a7897a3e9c3213c819af9d418042.apppaas.app/tasklog", formData);
        fetchTaskLogs(); // 추가 후 데이터를 다시 가져옵니다.
        setFormData({
          logId: "",
          taskId: "",
          taskName: "",
          title: "",
          description: "",
          taskDate: "",
        });
        setShowForm(false); // 폼 숨기기
        setError(""); // 에러 초기화
      } catch (error) {
        console.error("Failed to add task log:", error);
      }
    }
  };

  // 로그 수정
  const handleUpdate = async (event) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    if (user.status !== 'a') {
      alert("추가 권한이 없습니다.");
      return;
    }
    if (validateForm()) {
      try {
        await axios.put(`https://n0b85a7897a3e9c3213c819af9d418042.apppaas.app/tasklog/${formData.logId}`, formData);
        fetchTaskLogs(); // 수정 후 데이터를 다시 가져옵니다.
        setEditing(false);
        setShowForm(false); // 폼 숨기기
        setFormData({
          logId: "",
          taskId: "",
          taskName: "",
          title: "",
          description: "",
          taskDate: "",
          uptDate: ""
        });
        setError(""); // 에러 초기화
      } catch (error) {
        console.error("Failed to update task log:", error);
      }
    }
  };

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.taskName || !formData.title || !formData.description) {
      setError("모든 필드를 채워주세요.");
      return false;
    }
    return true;
  };

  // 로그 삭제
  const handleDelete = async (logId) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    if (user.status !== 'a') {
      alert("삭제 권한이 없습니다.");
      return;
    }
    try {
      await axios.delete(`https://n0b85a7897a3e9c3213c819af9d418042.apppaas.app/tasklog/${logId}`);
      fetchTaskLogs(); // 삭제 후 데이터를 다시 가져옵니다.
      setShowForm(false);
    } catch (error) {
      console.error("Failed to delete task log:", error);
    }
  };

  // 수정 모드 활성화
  const handleEdit = (log) => {
    setFormData(log);
    setEditing(true);
    setShowForm(true); // 폼 보이기
    setError(""); // 에러 초기화
  };

  // 테이블 상단의 "작업 내역 추가" 버튼 클릭시 폼 보이기
  const handleAddButtonClick = () => {
    setShowForm(true); // 폼 보이기
    setEditing(false);
    setFormData({
      logId: "",
      taskId: "",
      taskName: "",
      title: "",
      description: "",
      taskDate: "",
    });
    setError(""); // 에러 초기화
  };

  // 페이징된 데이터 추출
  const paginatedTaskLogs = taskLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get("https://n0b85a7897a3e9c3213c819af9d418042.apppaas.app/ProjectProgress/all");
      setProgress(response.data);
    } catch (error) {
      console.error("Failed to fetch progress", error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="task-log-container">
      <div className="same-line">
        <span className="main-title">작업 내역</span>
        {/* 작업 내역 추가 버튼 */}
        <button className="add-button" onClick={handleAddButtonClick}>작업 내역 추가</button>
      </div>
      <table className="log-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>작업대상</th>
            <th>제목</th>
            <th>일시</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTaskLogs.length > 0 ? paginatedTaskLogs.map((log) => (
            <tr key={log.logId} onClick={() => handleEdit(log)} style={{ cursor: 'pointer' }}>
              <td>{log.logId}</td>
              <td className="log-taskName">{log.taskName}</td>
              <td className=" log-title">
                {log.title}
              </td>
              <td>{new Date(log.taskDate).toLocaleDateString()}</td>
              <td>{log.uptDate ? new Date(log.uptDate).toLocaleDateString() : ""}</td> {/* 여기 수정 */}
            </tr>
          )) : <tr><td colSpan="5">작업 기록이 없습니다.</td></tr>}
        </tbody>
      </table>

      {/* 페이지 네비게이션 */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(taskLogs.length / pageSize) }, (_, index) => (
          <button key={index + 1} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>

      {/* 추가/수정 폼 */}
      {showForm && (
        <div className="Add-form-container">
          <div className="form-header">
                <h2 className="Add-form-title">작업 내역</h2>
                <button
                  className="close-button"
                  onClick={() => setShowForm(false)} // X 버튼 클릭 시 폼을 닫음
                >
                  &times;
                </button>
              </div>
            {error && <p className="error">{error}</p>}
            <form
            onSubmit={(e) => {
                e.preventDefault();
                editing ? handleUpdate() : handleAdd();
            }}
            >
            <ul>
            <li>
              <label>작업 대상 : </label>
              <select
                name="taskName"
                value={formData.taskName}
                onChange={(e) => handleChange(e)}
              >
                <option value="">작업 대상 선택</option>
                {progress.map((item) => (
                  <option key={item.taskId} value={item.taskName}>
                    {item.taskName}
                  </option>
                ))}
              </select>
            </li>

                <li>
                <label>제목 : </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="로그의 제목을 입력하세요."
                />
                </li>
                <li>
                  <label>설명 : </label>
                  <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="로그의 자세한 설명을 작성하세요."
                  />
                </li>
                <li>
                <label>작업 일시 : </label>
                  {editing ? (
                    <input
                      type="text"
                      name="taskDate"
                      value={new Date(formData.taskDate).toLocaleDateString()}
                      onChange={handleChange}
                      required
                      disabled={editing} // 수정 불가능하도록 설정
                    />
                  ) : (
                    <input
                      type="text"
                      name="taskDate"
                      value={new Date().toLocaleDateString()} // 오늘 날짜를 기본값으로 표시
                      readOnly // 읽기 전용으로 설정
                    />
                  )}
                  </li>
                  {formData.uptDate && 
                    <li>
                      <label>수정 일시 : </label>
                      <input type="text"
                      name="uptDate"
                      value={new Date(formData.uptDate).toLocaleDateString()}
                      disabled={editing} // 수정 불가능하도록 설정
                      />
                    </li>}
            </ul>
            <div className="form-actions">
                <button className="action-button" type="submit">{editing ? "수정" : "추가"}</button>
                {editing && (
                <button
                    type="button"
                    className="action-button"
                    onClick={() => {
                    if (window.confirm("정말로 삭제하시겠습니까?")) {
                        handleDelete(formData.logId);
                    }
                    }}
                >
                    삭제
                </button>
                )}
            </div>
            </form>
        </div>
        )}


    </div>
  );
};

export default TaskLogTable;
