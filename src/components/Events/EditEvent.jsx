import {
  Link,
  redirect,
  useNavigate,
  useParams,
  useSubmit,
  useNavigation,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const submit = useSubmit();
  const params = useParams();

  const { data, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 10000,
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   // [onMutate] mutate가 호출될 때마다 실행
  //   onMutate: async (data) => {
  //     // data = 백엔드에 보낸 데이터 { id: params.id, event: formData }
  //     const newEvent = data.event;

  //     await queryClient.cancelQueries({ queryKey: ["events", params.id] });
  //     // 롤백을 위해 기존 데이터 저장
  //     const previousEvent = queryClient.getQueryData(["events", params.id]);
  //     queryClient.setQueryData(["events", params.id], newEvent);

  //     return { previousEvent }; // context로 전달
  //   },
  //   // [백엔드 실패 시 실행]
  //   onError: (error, data, context) => {
  //     queryClient.setQueryData(["events", params.id], context.previousEvent);
  //   },
  //   // [onSeltteld] 성공 여부와 상관 없이 mutation이 완료될 때마다 호출
  //   // 백엔드에 있는 것과 동일한 데이터가 클라이언트에 있는지 확인 작업
  //   // 롤백 후 백엔드에서 다른 작업을 실행해 데이터가 클라이언트와 동기화되지 않은 경우, 리액트 쿼리에 데이터를 내부적으로 다시 가져오도록 강제하여 다시 동기화
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["events", params.id]);
  //   },
  // });

  function handleSubmit(formData) {
    // mutate({ id: params.id, event: formData });
    // navigate("../");
    submit(formData, { method: "PUT" }); // action()을 트리거
  }

  function handleClose() {
    navigate("../");
  }

  let content;

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
        {state === "submitting" ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

// 리액트 쿼리로 http 요청하기
export function loader({ params }) {
  // 1. useQuery 사용하지 않고 queryClient로 직접 데이터 로드 실행
  return queryClient.fetchQuery({
    // useQuery와 동일한 구성 객체 사용
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  // post 요청 함수 직접 사용
  await updateEvent({ id: params.id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]); // 낙관적 업데이트 사용 안 함
  return redirect("../"); // 리액트 라우터 제공함수 redirect로 부모 페이지로 이동
}
