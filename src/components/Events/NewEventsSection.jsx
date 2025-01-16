import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  // useQuery : 훅 자체적으로 작동해서 HTTP요청을 전송 & 필요한 이벤트 데이터 로딩 & 로딩 상태에 대한 정보 제공(-> 요청 전송 중 발생한 오류 파악 가능)
  // http 요청을 전송하는 로직은 내장되어 있지 않고, 요청을 관리하는 로직을 제공함
  // 요청 전송 코드는 직접 작성 필요
  // 객체를 전달
  // isPending : 응답을 받았는지
  // isError: 오류 응답을 받았는지
  // error:  발생한 오류에 대한 정보 (ex-오류 메세지)
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch data."}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
