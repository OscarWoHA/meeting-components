import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useRef, useState } from "react";
import ReactDatePicker, {
  registerLocale,
  setDefaultLocale,
} from "react-datepicker";
import { ChevronDown, ChevronUp, MoreVertical } from "react-feather";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import "./datepicker.scss";

registerLocale("nb", nb);
setDefaultLocale("nb");

interface Meeting {
  title: string;
  draft: boolean;
  archived: boolean;
  start: Date;
  end: Date;
  reference: {
    id: string;
  };
}

const meetings = new Array(12).fill(undefined).map<Meeting>((_n, idx) => ({
  title: "Styremøte " + idx,
  draft: idx % 2 !== 0,
  archived: idx > 5,
  start: new Date(),
  end: new Date(),
  reference: {
    id: "lol",
  },
}));

function MeetingListItemActions({ meeting }: { meeting: Meeting }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  return (
    <Dropdown isOpen={dropdownOpen} toggle={toggle} direction="down">
      <DropdownToggle color="clear">
        <MoreVertical />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem>
          {meeting.draft ? "Slett utkast" : "Arkiver møtet"}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

function MeetingListItem({ meeting }: { meeting: Meeting }) {
  return (
    <a
      className="d-flex bg-light p-3 rounded justify-content-between align-items-center"
      href={`#${meeting.reference.id}`}
      style={{
        color: "unset",
        textDecoration: "unset",
      }}
    >
      <div className="d-flex flex-column">
        {meeting.draft ? (
          <p className="mb-1 text-danger">{meeting.title}</p>
        ) : (
          <p className="mb-1">
            <strong>{meeting.title}</strong>
          </p>
        )}
        <p className="mb-0">
          {meeting.start.toISOString()} - {meeting.end.toISOString()}
        </p>
      </div>
      <MeetingListItemActions meeting={meeting} />
    </a>
  );
}

function MeetingList() {
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const [view, setView] = useState(0);

  const filteredMeetings = meetings.filter((meeting) => {
    if (view === 0) {
      return meeting.archived === false;
    }

    if (view === 1) {
      return meeting.archived === true;
    }

    return false;
  });

  const changeView = (toView: number) => {
    setShowAllMeetings(false);
    setView(toView);
  };

  return (
    <Card>
      <CardHeader className="d-flex justify-content-end">
        <Link className="btn btn-success" to="/create">
          Opprett nytt møte
        </Link>
      </CardHeader>
      <CardBody>
        <div className="d-flex mb-3">
          <Button
            style={{
              flex: 1,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            color="primary"
            outline={view !== 0}
            onClick={() => changeView(0)}
          >
            Aktive møter
          </Button>
          <Button
            style={{
              flex: 1,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            color="primary"
            outline={view !== 1}
            onClick={() => changeView(1)}
          >
            Arkiverte møter
          </Button>
        </div>
        <div
          className="d-flex flex-column mb-3"
          style={{
            gap: "1rem",
          }}
        >
          {filteredMeetings.slice(0, 5).map((meeting) => (
            <MeetingListItem meeting={meeting} />
          ))}
        </div>

        <Collapse isOpen={showAllMeetings}>
          <div
            className="d-flex flex-column"
            style={{
              gap: "1rem",
            }}
          >
            {filteredMeetings.slice(5, meetings.length).map((meeting) => (
              <MeetingListItem meeting={meeting} />
            ))}
          </div>
        </Collapse>

        <div className="d-flex justify-content-center">
          <Button
            color="link"
            onClick={() => setShowAllMeetings(!showAllMeetings)}
          >
            {showAllMeetings ? "Skjul" : "Vis"} resten av møtene
            <br />
            {showAllMeetings ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

enum ResponseStatus {
  UNKNOWN,
  ATTENDING,
  NOT_ATTENDING,
}

function ParticipantIconStatus({ status }: { status: ResponseStatus }) {
  let bgClass = "bg-warning";

  switch (status) {
    case ResponseStatus.ATTENDING:
      bgClass = "bg-success";
      break;
    case ResponseStatus.NOT_ATTENDING:
      bgClass = "bg-danger";
      break;
  }

  return (
    <div
      className={`${bgClass} text-white rounded-circle position-absolute d-flex justify-content-center align-items-center`}
      style={{ bottom: 0, right: 0, width: "1.25rem", height: "1.25rem" }}
    />
  );
}

function ParticipantIcon({
  fullName,
  status,
}: {
  fullName: string;
  status: ResponseStatus;
}) {
  const tooltipTarget = useRef<HTMLDivElement | null>(null);

  const nameParts = fullName.split(" ");

  const initials = (
    nameParts.length < 2
      ? fullName.slice(0, 2)
      : nameParts[0][0] + nameParts[nameParts.length - 1][0]
  ).toUpperCase();

  return (
    <div
      className="d-flex justify-content-center align-items-center position-relative"
      style={{ width: "4rem", height: "4rem" }}
      ref={tooltipTarget}
    >
      <p
        className="mb-0 bg-info text-white rounded-circle d-flex justify-content-center align-items-center"
        style={{
          fontSize: "1.25rem",
          userSelect: "none",
          width: "3.25rem",
          height: "3.25rem",
        }}
      >
        {initials}
      </p>
      <ParticipantIconStatus status={status} />
      <UncontrolledTooltip target={tooltipTarget}>
        {fullName}
      </UncontrolledTooltip>
    </div>
  );
}
interface CreateMeetingForm {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  address: {
    address: string;
    postCode: string;
    city: string;
  };
  comment: string;
}
function timeToDecimal(time: string) {
  const t = time.split(":");
  return parseInt(t[0], 10) * 1 + parseInt(t[1], 10) / 60;
}
function CreateMeeting() {
  const {
    control,
    formState: { isDirty, isValid, errors },
    handleSubmit,
  } = useForm<CreateMeetingForm>({
    mode: "all",
    resolver: (values) => {
      const startTime = timeToDecimal(values.startTime);
      const endTime = timeToDecimal(values.endTime);

      if (startTime > endTime) {
        return {
          values,
          errors: {
            endTime: {
              type: "min",
            },
          },
        };
      }

      return {
        values,
        errors: {},
      };
    },
    defaultValues: {
      title: "Styremøte",
      date: new Date(),
      startTime: format(new Date(), "HH:mm"),
      endTime: format(new Date(), "HH:mm"),
      address: {
        address: "",
        postCode: "",
        city: "",
      },
      comment: "",
    },
  });

  return (
    <Row>
      <Col lg={8}>
        <Card>
          <CreateMeetingHeader control={control} />
          <CardBody className="p-3">
            <div className="bg-light rounded-xs">
              <p className="p-3 mb-0 bg-gray-2">Deltakere</p>
              <div className="d-flex flex-wrap p-3" style={{ gap: ".5rem" }}>
                <ParticipantIcon
                  fullName="Oscar Wold"
                  status={ResponseStatus.ATTENDING}
                />
                <ParticipantIcon
                  fullName="Oscar"
                  status={ResponseStatus.UNKNOWN}
                />
                <ParticipantIcon
                  fullName="Oscar Wold Halland"
                  status={ResponseStatus.NOT_ATTENDING}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={4}>
        <Card>
          <form
            onSubmit={handleSubmit((data) => {
              console.log(data);
            })}
          >
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Møteinformasjon</h5>
              <Button
                type="submit"
                disabled={!isDirty || !isValid}
                color="success"
              >
                Lagre
              </Button>
            </CardHeader>
            <CardBody>
              <FormGroup>
                <Label>Tittel</Label>

                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => <Input type="text" {...field} />}
                />
              </FormGroup>

              <FormGroup>
                <Label>Dato</Label>

                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <ReactDatePicker
                      calendarClassName="d-flex justify-content-center py-1"
                      inline
                      selected={field.value}
                      onChange={(date) => field.onChange(date)}
                    />
                  )}
                />
              </FormGroup>

              <FormGroup>
                <Label>Start</Label>
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field }) => <Input type="time" {...field} />}
                />
              </FormGroup>

              <FormGroup>
                <Label>Slutt</Label>
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field, fieldState: { error } }) => (
                    <Input type="time" invalid={!!error} {...field} />
                  )}
                />
                {errors.endTime && (
                  <FormFeedback>
                    Sluttidspunktet må være etter starttidspunktet
                  </FormFeedback>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Adresse</Label>
                <Controller
                  control={control}
                  name="address.address"
                  render={({ field }) => (
                    <Input type="text" {...field} placeholder="Adresse" />
                  )}
                />
              </FormGroup>
              <div className="d-flex" style={{ gap: "1rem" }}>
                <FormGroup style={{ flex: 0.7 }}>
                  <Label>Postnummer</Label>
                  <Controller
                    control={control}
                    name="address.postCode"
                    render={({ field }) => (
                      <Input type="text" {...field} placeholder="Postnummer" />
                    )}
                  />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Sted</Label>
                  <Controller
                    control={control}
                    name="address.city"
                    render={({ field }) => (
                      <Input type="text" {...field} placeholder="Sted" />
                    )}
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label>Kommentar</Label>
                <Controller
                  control={control}
                  name="comment"
                  render={({ field }) => (
                    <Input type="textarea" placeholder="Kommentar" {...field} />
                  )}
                />
              </FormGroup>
            </CardBody>
          </form>
        </Card>
      </Col>
    </Row>
  );
}

function CreateMeetingHeader({
  control,
}: {
  control: Control<CreateMeetingForm>;
}) {
  const title = useWatch({ control, name: "title" });
  const endTime = useWatch({ control, name: "endTime" });
  const startTime = useWatch({ control, name: "startTime" });
  const date = useWatch({ control, name: "date" });

  return (
    <CardHeader>
      <h5>{title}</h5>
      <p className="mb-0">
        {format(date, "dd. MMMM yyyy", { locale: nb })} {startTime} - {endTime}
      </p>
    </CardHeader>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Container>
        <Routes>
          <Route path="/" element={<MeetingList />} />
          <Route path="/create" element={<CreateMeeting />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
