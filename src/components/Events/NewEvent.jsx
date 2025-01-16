import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../util/http.js";

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      // 성공한 시에만 navigate() 호출
      navigate("/events");
      queryClient.invalidateQueries({
        queryKey: ["events"],
        // exact: true, 해당 쿼리키와 정확히 일치하는 쿼리만
      }); // 변형 성공 시 쿼리 무효화: 해당 쿼리키가 포함된 모든 쿼리에게 데이터를 다시 불러오라고 알림
    },
  });

  function handleSubmit(formData) {
    mutate({ event: formData }); // 폼이 제출될 때마다 리액트 쿼리를 이용해 요청 전송
    navigate();
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
