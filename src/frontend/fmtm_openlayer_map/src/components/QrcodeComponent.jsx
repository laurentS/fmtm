import React, { useState } from "react";
import BasicCard from "fmtm/BasicCard";
// import Activities from "./Activities";
import environment from "fmtm/environment";
import { ProjectFilesById } from "../api/Files";
import { ShareSocial } from "react-share-social";
import CoreModules from "fmtm/CoreModules";
import AssetModules from "fmtm/AssetModules";

const TasksComponent = ({ type, task, defaultTheme }) => {
  const [open, setOpen] = useState(false);
  const params = CoreModules.useParams();
  const { loading, qrcode } = ProjectFilesById(
    `${environment.baseApiUrl}/projects/${environment.decode(params.id)}`,
    task
  );

  const socialStyles = {
    copyContainer: {
      border: `1px solid ${defaultTheme.palette.info["main"]}`,
      background: defaultTheme.palette.info["info"],
      color: defaultTheme.palette.info["main"],
    },
    title: {
      color: defaultTheme.palette.info["main"],
      fontStyle: "italic",
    },
  };

  return (
    <CoreModules.Stack>
      <CoreModules.Stack
        direction={type == "s" ? "column" : type == "xs" ? "column" : "row"}
        spacing={2}
        mt={"1%"}
      >
        <BasicCard
          subtitle={{}}
          contentProps={{}}
          variant={"elevation"}
          headerStatus={true}
          content={
            <CoreModules.Stack direction={"column"} justifyContent={"center"}>
              <CoreModules.Stack direction={"row"} justifyContent={"center"}>
                <CoreModules.Typography variant="h2">
                  {`Qrcode`}
                </CoreModules.Typography>
              </CoreModules.Stack>

              <CoreModules.Stack direction={"row"} justifyContent={"center"}>
                {qrcode == "" ? (
                  <CoreModules.Stack>
                    <CoreModules.SkeletonTheme
                      baseColor={defaultTheme.palette.loading["skeleton_rgb"]}
                      highlightColor={
                        defaultTheme.palette.loading["skeleton_rgb"]
                      }
                    >
                      <CoreModules.Skeleton width={170} count={7} />
                    </CoreModules.SkeletonTheme>
                  </CoreModules.Stack>
                ) : (
                  <img id="qrcodeImg" src={`data:image/png;base64,${qrcode}`} alt="qrcode" />
                )}
              </CoreModules.Stack>

              <CoreModules.Stack
                mt={"1.5%"}
                direction={"row"}
                justifyContent={"center"}
                spacing={5}
              >
                <CoreModules.Stack
                  width={40}
                  height={40}
                  borderRadius={55}
                  boxShadow={2}
                  justifyContent={"center"}
                >
                  <CoreModules.IconButton
                    onClick={() => {
                      const linkSource = `data:image/png;base64,${qrcode}`;
                      const downloadLink = document.createElement("a");
                      downloadLink.href = linkSource;
                      downloadLink.download = `Task_${task}`;
                      downloadLink.click();
                    }}
                    disabled={loading}
                    color="info"
                    aria-label="download qrcode"
                  >
                    <AssetModules.FileDownloadIcon sx={{ fontSize: defaultTheme.typography.fontSize }} />
                  </CoreModules.IconButton>
                </CoreModules.Stack>

                <CoreModules.Stack
                  width={40}
                  height={40}
                  borderRadius={55}
                  boxShadow={2}
                  justifyContent={"center"}
                >
                  <CoreModules.IconButton
                    onClick={() => {
                      setOpen(true);
                    }}
                    disabled={loading}
                    color="info"
                    aria-label="share qrcode"
                  >
                    <AssetModules.ShareIcon sx={{ fontSize: defaultTheme.typography.fontSize }} />
                  </CoreModules.IconButton>

                  {/* <BasicDialog
                    title={"Share with"}
                    actions={
                      <ShareSocial
                        url={`Task_${task}`}
                        socialTypes={["whatsapp", "twitter"]}
                        onSocialButtonClicked={(data) => console.log(data)}
                        style={socialStyles}
                      />
                    }
                    onClose={() => {
                      setOpen(false);
                    }}
                    open={open}
                  /> */}
                </CoreModules.Stack>
              </CoreModules.Stack>
            </CoreModules.Stack>
          }
        />
      </CoreModules.Stack>
    </CoreModules.Stack>
  );
};

export default TasksComponent;