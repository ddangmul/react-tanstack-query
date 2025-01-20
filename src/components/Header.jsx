import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  // [ useIsfetching ] 리액트 쿼리가 현재 데이터를 가져오지 않으면 0, 가져오면 더 높은 숫자
  const fetching = useIsFetching();
  return (
    <>
      <div id="main-header-loading">{fetching > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
