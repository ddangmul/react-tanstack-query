import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function NewEvent() {
  const navigate = useNavigate();

  // mutate : 컴포넌트 내 어디서든 이 함수를 호출해 요청 전송
  const { mutate, isPending, isError, error } = useMutation({
    // mutationKey: 필수 아님. 변형은 응답 데이터를 캐시처리하지 않음. 백엔드에서 데이터를 변경하기 때문
    mutationFn: createNewEvent,
  });

  function handleSubmit(formData) {
    mutate({ event: formData }); // 폼이 제출될 때마다 리액트 쿼리를 이용해 요청 전송
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "Submitting..."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create event"
          message={
            error.info?.message ||
            "Failed to create event. Please check tour inputs and try again later."
          }
        />
      )}
    </Modal>
  );
}
