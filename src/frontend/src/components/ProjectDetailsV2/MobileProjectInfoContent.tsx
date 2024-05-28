import React from 'react';
import AssetModules from '@/shared/AssetModules';
import { projectInfoType } from '@/models/project/projectModel';
import Button from '@/components/common/Button';
import { useNavigate } from 'react-router-dom';

const MobileProjectInfoContent = ({ projectInfo }: { projectInfo: projectInfoType }) => {
  const navigate = useNavigate();

  return (
    <div className="fmtm-flex fmtm-flex-col fmtm-gap-3 fmtm-mb-[10vh]">
      <div className="fmtm-flex fmtm-gap-3 fmtm-border-b-[1px] fmtm-pb-2">
        <AssetModules.InfoIcon className=" fmtm-text-primaryRed" sx={{ fontSize: '35px' }} />
        <p className="fmtm-text-2xl">Project Information</p>
      </div>
      <div className="fmtm-flex fmtm-gap-3 fmtm-justify-between">
        <p className="fmtm-text-2xl fmtm-text-primaryRed">#{projectInfo?.id}</p>
        <Button
          btnText="Manage Project"
          icon={<AssetModules.SettingsIcon />}
          onClick={() => {
            navigate(`/manage-project/${projectInfo?.id}`);
          }}
          btnType="other"
          className="!fmtm-text-base !fmtm-pr-2"
        />
      </div>
      <div className="fmtm-flex fmtm-gap-3">
        <p className="fmtm-text-xl">Name: </p>
        <p className="fmtm-text-xl">{projectInfo?.title}</p>
      </div>
      <div className="fmtm-flex fmtm-flex-col">
        <p className="fmtm-text-xl">Short Description:</p>
        <p className="fmtm-text-lg fmtm-text-grey-700">{projectInfo?.short_description}</p>
      </div>
      <div className="fmtm-flex fmtm-flex-col">
        <p className="fmtm-text-xl">Description:</p>
        <p className="fmtm-text-lg fmtm-text-grey-700">{projectInfo?.description}</p>
      </div>
    </div>
  );
};

export default MobileProjectInfoContent;
