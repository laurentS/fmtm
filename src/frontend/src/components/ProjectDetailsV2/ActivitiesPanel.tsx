/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react';
import AssetModules from '@/shared/AssetModules';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { ActivitiesCardSkeletonLoader, ShowingCountSkeletonLoader } from '@/components/ProjectDetailsV2/SkeletonLoader';
import { taskHistoryListType } from '@/models/project/projectModel';
import { useAppSelector } from '@/types/reduxTypes';
import { useDispatch } from 'react-redux';

const ActivitiesPanel = ({ defaultTheme, state, params, map, view, mapDivPostion, states }) => {
  const dispatch = useDispatch();
  const id = params.id;
  const [searchText, setSearchText] = useState<string>('');
  const [taskHistories, setTaskHistories] = useState<taskHistoryListType[]>([]);
  const [allActivities, setAllActivities] = useState(0);
  const projectActivityLoading = useAppSelector((state) => state?.project?.projectActivityLoading);
  const projectTaskActivityList = useAppSelector((state) => state?.project?.projectTaskActivity);
  const selectedTask = useAppSelector((state) => state.task.selectedTask);

  const handleOnchange = (event) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    let taskHistories: taskHistoryListType[] = projectTaskActivityList;

    setAllActivities(projectTaskActivityList.length);
    let finalTaskHistory: taskHistoryListType[] = taskHistories.filter((task) => {
      return task.action_text.split(':')[1].replace(/\s+/g, '').toString().includes(searchText.toString());
    });
    if (searchText != '') {
      setTaskHistories(finalTaskHistory);
    } else {
      setTaskHistories(taskHistories);
    }
  }, [state, searchText, projectTaskActivityList, selectedTask]);

  const zoomToTask = (taskId) => {
    let geojson = {};
    const index = state.findIndex((project) => project.id == params.id);
    if (index != -1) {
      const taskIndex = state[index]?.taskBoundries.findIndex((task) => task?.index == taskId);
      if (index != -1) {
        geojson = state[index]?.taskBoundries[taskIndex]?.outline_geojson;
      }
    }

    const olFeature = new Feature({
      geometry: new Polygon(geojson.geometry.coordinates).transform('EPSG:4326', 'EPSG:3857'),
    });
    // Get the extent of the OpenLayers feature
    const extent = olFeature.getGeometry()?.getExtent();
    map.getView().fit(extent, {
      padding: [0, 0, 0, 0],
    });
  };

  const ActivitiesCard = ({ taskHistory }: { taskHistory: taskHistoryListType }) => {
    const actionDate = taskHistory?.action_date?.split('T')[0];
    const actionTime = `${taskHistory?.action_date?.split('T')[1].split(':')[0]}:${taskHistory?.action_date
      ?.split('T')[1]
      .split(':')[1]}`;
    return (
      <div className="fmtm-flex fmtm-gap-2 fmtm-items-center fmtm-justify-between fmtm-px-1 fmtm-border-b-[2px] fmtm-border-white fmtm-py-3">
        <div className="fmtm-flex fmtm-items-center">
          <div className="fmtm-w-[2.81rem] fmtm-h-[2.81rem] fmtm-border fmtm-rounded-full fmtm-overflow-hidden fmtm-mr-4">
            {taskHistory?.profile_img ? (
              <img src={taskHistory?.profile_img} alt="Profile Picture" />
            ) : (
              <div className="fmtm-w-full fmtm-h-full fmtm-flex fmtm-justify-center fmtm-items-center fmtm-bg-white">
                <AssetModules.PersonIcon color="success" sx={{ fontSize: '30px' }} />
              </div>
            )}
          </div>
          <div className="fmtm-text-base">
            <span className="fmtm-text-[#555555] fmtm-font-medium fmtm-font-archivo">{taskHistory?.username} </span>
            <span className="fmtm-text-[#7A7676] fmtm-font-extralight fmtm-italic fmtm-font-archivo">
              updated status to{' '}
            </span>
            <p style={{ color: defaultTheme.statusTextTheme[taskHistory?.status] }} className="fmtm-font-archivo">
              {taskHistory?.status}
            </p>
            <div className="fmtm-flex fmtm-items-center fmtm-justify-between">
              <p className="fmtm-font-archivo fmtm-text-sm fmtm-text-[#7A7676]">#{selectedTask}</p>
              <div className="fmtm-flex fmtm-items-center fmtm-mb-1">
                <AssetModules.AccessTimeIcon className="fmtm-text-primaryRed" style={{ fontSize: '20px' }} />
              </div>
              <p className="fmtm-font-archivo fmtm-text-sm fmtm-text-[#7A7676]">
                <span>{actionDate} </span>
                <span>{actionTime}</span>
              </p>
            </div>
          </div>
        </div>
        <div title="Zoom to Task" onClick={() => zoomToTask(selectedTask)}>
          <AssetModules.MapIcon
            className="fmtm-text-[#9B9999] hover:fmtm-text-[#555555] fmtm-cursor-pointer"
            style={{ fontSize: '20px' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fmtm-w-full fmtm-px-2 sm:fmtm-px-0 fmtm-relative sm:fmtm-overflow-y-scroll scrollbar">
      <div className="fmtm-sticky fmtm-overflow-y-scroll scrollbar sm:fmtm-overflow-visible -fmtm-top-[2px] sm:fmtm-top-0 fmtm-bg-white sm:fmtm-bg-[#F5F5F5]">
        <div className="fmtm-flex fmtm-items-center fmtm-w-full fmtm-justify-between fmtm-gap-4">
          <input
            type="text"
            onChange={handleOnchange}
            value={searchText}
            placeholder="Search by username"
            className="fmtm-w-full fmtm-text-md fmtm-px-2 fmtm-py-[0.18rem] fmtm-outline-none fmtm-border-[1px] fmtm-border-[#E7E2E2] fmtm-mr-2"
          />
        </div>
        {projectActivityLoading ? (
          <ShowingCountSkeletonLoader />
        ) : (
          <p className="fmtm-text-[#A8A6A6] fmtm-text-base fmtm-my-1">
            showing {taskHistories?.length} of {allActivities} activities
          </p>
        )}
      </div>
      <div>
        {projectActivityLoading ? (
          <div>
            {Array.from({ length: 10 }).map((_, i) => (
              <ActivitiesCardSkeletonLoader key={i} />
            ))}
          </div>
        ) : taskHistories?.length === 0 ? (
          <p className="fmtm-mt-5 fmtm-text-center fmtm-text-xl fmtm-text-gray-400">No Task History!</p>
        ) : (
          <div>{taskHistories?.map((taskHistory) => <ActivitiesCard taskHistory={taskHistory} />)}</div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPanel;
