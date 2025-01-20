import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // [onMutate] mutate가 호출될 때마다 실행
    onMutate: async (data) => {
      // data = 백엔드에 보낸 데이터 { id: params.id, event: formData }
      const newEvent = data.event;

      await queryClient.cancelQueries({ queryKey: ["events", params.id] });
      // 롤백을 위해 기존 데이터 저장
      const previousEvent = queryClient.getQueryData(["events", params.id]);
      queryClient.setQueryData(["events", params.id], newEvent);

      return { previousEvent }; // context로 전달
    },
    // [백엔드 실패 시 실행]
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", params.id], context.previousEvent);
    },
    // [onSeltteld] 성공 여부와 상관 없이 mutation이 완료될 때마다 호출
    // 백엔드에 있는 것과 동일한 데이터가 클라이언트에 있는지 확인 작업
    // 롤백 후 백엔드에서 다른 작업을 실행해 데이터가 클라이언트와 동기화되지 않은 경우, 리액트 쿼리에 데이터를 내부적으로 다시 가져오도록 강제하여 다시 동기화
    onSettled: () => {
      queryClient.invalidateQueries(["events", params.id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={error.info?.message}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
