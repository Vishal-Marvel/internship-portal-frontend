import { ApprovalStatus } from "@/schema";
import ApproveRejectSendBack from "./ApproveRejectSendBack";

const Approval = ({
  approval,
  role,
  id,
  rejected,
}: {
  approval: ApprovalStatus;
  role: string;
  id: string;
  rejected: boolean;
}) => {
  const isStudent = role && role.includes("student");
  const isMentor = role && role.includes("mentor");
  const isInternshipCoordinator =
    role && role.includes("internshipcoordinator");
  const isHod = role && role.includes("hod");
  const isTapCell = role && role.includes("tapcell");
  const isPrincial = role && role.includes("principal");
  return (
    <div id="approval" className="flex flex-col gap-2">
      <div className="grid md:grid-cols-[28%_3%_69%] grid-cols-[40%_3%_55%]  items-center">
        <span className="text-lg font-semibold">Mentor</span>
        <span>:</span>
        {!isStudent && !rejected && isMentor && approval ? (
          approval?.mentor ? (
            <span> {approval?.mentor ? "Approved" : "Not Approved"}</span>
          ) : (
            <ApproveRejectSendBack id={id} role={"mentor"}  />
          )
        ) : (
          <span>
            {rejected && approval?.rejectedBy.includes("mentor") ? (
              <span>Rejected</span>
            ) : approval?.mentor ? (
              "Approved"
            ) : (
              "Not Approved"
            )}
          </span>
        )}
      </div>
      <div className="grid md:grid-cols-[28%_3%_69%] grid-cols-[40%_3%_55%]  items-center">
        <span className="text-lg font-semibold">Internship Coordinator</span>
        <span>:</span>
        {!isStudent &&
        !rejected &&
        isInternshipCoordinator &&
        approval &&
        approval?.mentor ? (
          approval?.internshipcoordinator ? (
            <span>
              {" "}
              {approval?.internshipcoordinator ? "Approved" : "Not Approved"}
            </span>
          ) : (
            <ApproveRejectSendBack
              id={id}
              role={"internshipcoordinator"}
              
            />
          )
        ) : (
          <span>
            {rejected &&
            approval?.rejectedBy.includes("internshipcoordinator") ? (
              <span>Rejected</span>
            ) : approval?.internshipcoordinator ? (
              "Approved"
            ) : (
              "Not Approved"
            )}
          </span>
        )}
      </div>
      <div className="grid md:grid-cols-[28%_3%_69%] grid-cols-[40%_3%_55%]  items-center">
        <span className="text-lg font-semibold">Hod</span>
        <span>:</span>
        {!isStudent &&
        !rejected &&
        isHod &&
        approval &&
        approval?.internshipcoordinator ? (
          approval?.hod ? (
            <span> {approval?.hod ? "Approved" : "Not Approved"}</span>
          ) : (
            <ApproveRejectSendBack id={id} role={"hod"}  />
          )
        ) : (
          <span>
            {rejected && approval?.rejectedBy.includes("hod") ? (
              <span>Rejected</span>
            ) : approval?.hod ? (
              "Approved"
            ) : (
              "Not Approved"
            )}
          </span>
        )}
      </div>
      <div className="grid md:grid-cols-[28%_3%_69%] grid-cols-[40%_3%_55%]  items-center ">
        <span className="text-lg font-semibold">Tap Cell</span>
        <span>:</span>
        {!isStudent && !rejected && isTapCell && approval && approval?.hod ? (
          approval?.tap_cell ? (
            <span> {approval?.tap_cell ? "Approved" : "Not Approved"}</span>
          ) : (
            <ApproveRejectSendBack id={id} role={"tapcell"}  />
          )
        ) : (
          <span>
            {rejected && approval?.rejectedBy.includes("tapcell") ? (
              <span>Rejected</span>
            ) : approval?.tap_cell ? (
              "Approved"
            ) : (
              "Not Approved"
            )}
          </span>
        )}
      </div>
      <div className="grid md:grid-cols-[28%_3%_69%] grid-cols-[40%_3%_55%]  items-center">
        <span className="text-lg font-semibold">Principal</span>
        <span>:</span>
        {!isStudent &&
        !rejected &&
        isPrincial &&
        approval &&
        approval?.tap_cell ? (
          approval?.principal ? (
            <span> {approval?.principal ? "Approved" : "Not Approved"}</span>
          ) : (
            <ApproveRejectSendBack id={id} role={"principal"}  />
          )
        ) : (
          <span>
            {rejected && approval?.rejectedBy.includes("principal") ? (
              <span>Rejected</span>
            ) : approval?.principal ? (
              "Approved"
            ) : (
              "Not Approved"
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default Approval;
