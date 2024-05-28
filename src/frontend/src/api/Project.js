import { ProjectActions } from '@/store/slices/ProjectSlice';
import { CommonActions } from '@/store/slices/CommonSlice';
import CoreModules from '@/shared/CoreModules';
import { task_status } from '@/types/enums';
import axios from 'axios';
import { writeBinaryToOPFS } from '@/api/Files';

export const ProjectById = (existingProjectList, projectId) => {
  return async (dispatch) => {
    const fetchProjectById = async (projectId, existingProjectList) => {
      try {
        dispatch(ProjectActions.SetProjectDetialsLoading(true));
        const project = await CoreModules.axios.get(`${import.meta.env.VITE_API_URL}/projects/${projectId}`);
        const projectResp = project.data;
        const persistingValues = projectResp.tasks.map((data) => {
          return {
            id: data.id,
            index: data.project_task_index,
            outline_geojson: data.outline_geojson,
            task_status: task_status[data.task_status],
            locked_by_uid: data.locked_by_uid,
            locked_by_username: data.locked_by_username,
            task_history: data.task_history,
          };
        });
        // At top level id project id to object
        const projectTaskBoundries = [{ id: projectResp.id, taskBoundries: persistingValues }];
        dispatch(ProjectActions.SetProjectTaskBoundries([{ ...projectTaskBoundries[0] }]));
        dispatch(
          ProjectActions.SetProjectInfo({
            id: projectResp.id,
            outline_geojson: projectResp.outline_geojson,
            priority: projectResp.priority || 2,
            title: projectResp.project_info?.name,
            location_str: projectResp.location_str,
            description: projectResp.project_info?.description,
            short_description: projectResp.project_info?.short_description,
            num_contributors: projectResp.num_contributors,
            total_tasks: projectResp.total_tasks,
            tasks_mapped: projectResp.tasks_mapped,
            tasks_validated: projectResp.tasks_validated,
            xform_category: projectResp.xform_category,
            tasks_bad: projectResp.tasks_bad,
            data_extract_url: projectResp.data_extract_url,
            instructions: projectResp?.project_info?.per_task_instructions,
            odk_token: projectResp?.odk_token,
            custom_tms_url: projectResp?.custom_tms_url,
            organisation_id: projectResp?.organisation_id,
            organisation_logo: projectResp?.organisation_logo,
          }),
        );
        dispatch(ProjectActions.SetProjectDetialsLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetProjectDetialsLoading(false));
        dispatch(
          CommonActions.SetSnackBar({
            open: true,
            message: 'Failed to fetch project.',
            variant: 'error',
            duration: 2000,
          }),
        );
      }
    };

    await fetchProjectById(projectId, existingProjectList);
    dispatch(ProjectActions.SetNewProjectTrigger());
  };
};

export const DownloadProjectForm = (url, payload, projectId) => {
  return async (dispatch) => {
    dispatch(ProjectActions.SetDownloadProjectFormLoading({ type: payload, loading: true }));

    const fetchProjectForm = async (url, payload, projectId) => {
      try {
        let response;
        if (payload === 'form') {
          response = await CoreModules.axios.get(url, { responseType: 'blob' });
        } else {
          response = await CoreModules.axios.get(url, {
            responseType: 'blob',
          });
        }
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(response.data);
        a.download = `${payload === 'form' ? `project_form_${projectId}.xls` : `task_polygons_${projectId}.geojson`}`;
        a.click();
        dispatch(ProjectActions.SetDownloadProjectFormLoading({ type: payload, loading: false }));
      } catch (error) {
        dispatch(ProjectActions.SetDownloadProjectFormLoading({ type: payload, loading: false }));
      } finally {
        dispatch(ProjectActions.SetDownloadProjectFormLoading({ type: payload, loading: false }));
      }
    };
    await fetchProjectForm(url, payload, projectId);
  };
};
export const DownloadDataExtract = (url, payload) => {
  return async (dispatch) => {
    dispatch(ProjectActions.SetDownloadDataExtractLoading(true));

    const getDownloadExtract = async (url, payload) => {
      try {
        let response;

        response = await CoreModules.axios.get(url, {
          responseType: 'blob',
        });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(response.data);
        a.download = `Data_Extract.geojson`;
        a.click();
        dispatch(ProjectActions.SetDownloadDataExtractLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetDownloadDataExtractLoading(false));
      } finally {
        dispatch(ProjectActions.SetDownloadDataExtractLoading(false));
      }
    };
    await getDownloadExtract(url, payload);
  };
};
export const GetTilesList = (url) => {
  return async (dispatch) => {
    dispatch(ProjectActions.SetTilesListLoading(true));

    const fetchTilesList = async (url) => {
      try {
        const response = await CoreModules.axios.get(url);
        dispatch(ProjectActions.SetTilesList(response.data));
        dispatch(ProjectActions.SetTilesListLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetTilesListLoading(false));
      } finally {
        dispatch(ProjectActions.SetTilesListLoading(false));
      }
    };
    await fetchTilesList(url);
  };
};
export const GenerateProjectTiles = (url, payload) => {
  return async (dispatch) => {
    dispatch(ProjectActions.SetGenerateProjectTilesLoading(true));

    const generateProjectTiles = async (url, payload) => {
      try {
        const response = await CoreModules.axios.get(url);
        dispatch(GetTilesList(`${import.meta.env.VITE_API_URL}/projects/${payload}/tiles-list/`));
        dispatch(ProjectActions.SetGenerateProjectTilesLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetGenerateProjectTilesLoading(false));
      } finally {
        dispatch(ProjectActions.SetGenerateProjectTilesLoading(false));
      }
    };
    await generateProjectTiles(url, payload);
  };
};

export const DownloadTile = (url, payload, toOpfs = false) => {
  return async (dispatch) => {
    dispatch(ProjectActions.SetDownloadTileLoading({ type: payload, loading: true }));

    const getDownloadTile = async (url, payload, toOpfs) => {
      try {
        const response = await CoreModules.axios.get(url, {
          responseType: 'arraybuffer',
        });

        // Get filename from content-disposition header
        const tileData = response.data;

        if (toOpfs) {
          // Copy to OPFS filesystem for offline use
          const projectId = payload.id;
          const filePath = `${projectId}/all.pmtiles`;
          await writeBinaryToOPFS(filePath, tileData);
          // Set the OPFS file path to project state
          dispatch(ProjectActions.SetProjectOpfsBasemapPath(filePath));
          return;
        }

        const filename = response.headers['content-disposition'].split('filename=')[1];
        // Create Blob from ArrayBuffer
        const blob = new Blob([tileData], { type: response.headers['content-type'] });
        const downloadUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        a.click();

        // Clean up object URL
        URL.revokeObjectURL(downloadUrl);

        dispatch(ProjectActions.SetDownloadTileLoading({ type: payload, loading: false }));
      } catch (error) {
        dispatch(ProjectActions.SetDownloadTileLoading({ type: payload, loading: false }));
      } finally {
        dispatch(ProjectActions.SetDownloadTileLoading({ type: payload, loading: false }));
      }
    };
    await getDownloadTile(url, payload, toOpfs);
  };
};

export const GetProjectDashboard = (url) => {
  return async (dispatch) => {
    const getProjectDashboard = async (url) => {
      try {
        dispatch(ProjectActions.SetProjectDashboardLoading(true));
        const response = await CoreModules.axios.get(url);
        dispatch(ProjectActions.SetProjectDashboardDetail(response.data));
        dispatch(ProjectActions.SetProjectDashboardLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetProjectDashboardLoading(false));
      } finally {
        dispatch(ProjectActions.SetProjectDashboardLoading(false));
      }
    };
    await getProjectDashboard(url);
  };
};

export const GetEntityInfo = (url) => {
  return async (dispatch) => {
    const getEntityOsmMap = async (url) => {
      try {
        dispatch(ProjectActions.SetEntityToOsmIdMappingLoading(true));
        dispatch(CoreModules.TaskActions.SetTaskSubmissionStatesLoading(true));
        const response = await CoreModules.axios.get(url);
        dispatch(ProjectActions.SetEntityToOsmIdMapping(response.data));
        dispatch(CoreModules.TaskActions.SetTaskSubmissionStates(response.data));
        dispatch(ProjectActions.SetEntityToOsmIdMappingLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetEntityToOsmIdMappingLoading(false));
        dispatch(CoreModules.TaskActions.SetTaskSubmissionStatesLoading(false));
      } finally {
        dispatch(ProjectActions.SetEntityToOsmIdMappingLoading(false));
        dispatch(CoreModules.TaskActions.SetTaskSubmissionStatesLoading(false));
      }
    };
    await getEntityOsmMap(url);
  };
};

export const GetProjectComments = (url) => {
  return async (dispatch) => {
    const getProjectComments = async (url) => {
      try {
        dispatch(ProjectActions.SetProjectGetCommentsLoading(true));
        const response = await CoreModules.axios.get(url);
        dispatch(ProjectActions.SetProjectCommentsList(response.data));
        dispatch(ProjectActions.SetProjectGetCommentsLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetProjectGetCommentsLoading(false));
      } finally {
        dispatch(ProjectActions.SetProjectGetCommentsLoading(false));
      }
    };
    await getProjectComments(url);
  };
};

export const PostProjectComments = (url, payload) => {
  return async (dispatch) => {
    const postProjectComments = async (url) => {
      try {
        dispatch(ProjectActions.SetPostProjectCommentsLoading(true));
        const response = await CoreModules.axios.post(url, payload);
        dispatch(ProjectActions.UpdateProjectCommentsList(response.data));
        dispatch(ProjectActions.SetPostProjectCommentsLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetPostProjectCommentsLoading(false));
      } finally {
        dispatch(ProjectActions.SetPostProjectCommentsLoading(false));
      }
    };
    await postProjectComments(url);
  };
};

export const GetProjectTaskActivity = (url) => {
  return async (dispatch) => {
    const getProjectActivity = async (url) => {
      try {
        dispatch(ProjectActions.SetProjectTaskActivityLoading(true));
        const response = await CoreModules.axios.get(url);
        dispatch(ProjectActions.SetProjectTaskActivity(response.data));
        dispatch(ProjectActions.SetProjectTaskActivityLoading(false));
      } catch (error) {
        dispatch(ProjectActions.SetProjectTaskActivityLoading(false));
      } finally {
        dispatch(ProjectActions.SetProjectTaskActivityLoading(false));
      }
    };
    await getProjectActivity(url);
  };
};

export const UpdateEntityStatus = (url, payload) => {
  return async (dispatch) => {
    const updateEntityStatus = async (url, payload) => {
      try {
        dispatch(ProjectActions.UpdateEntityStatusLoading(true));
        const response = await CoreModules.axios.post(url, payload);
        dispatch(ProjectActions.UpdateEntityStatus(response.data));
        dispatch(ProjectActions.UpdateEntityStatusLoading(false));
      } catch (error) {
        dispatch(ProjectActions.UpdateEntityStatusLoading(false));
      }
    };
    await updateEntityStatus(url, payload);
  };
};

export const DownloadSubmissionGeojson = (url, projectName) => {
  return async (dispatch) => {
    dispatch(ProjectActions.SetDownloadSubmissionGeojsonLoading(true));

    const downloadSubmissionGeojson = async (url) => {
      try {
        const response = await CoreModules.axios.get(url, { responseType: 'blob' });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(response.data);
        a.download = `${projectName}.geojson`;
        a.click();
        dispatch(ProjectActions.SetDownloadSubmissionGeojsonLoading(false));
      } catch (error) {
        dispatch(
          CommonActions.SetSnackBar({
            open: true,
            message: 'Failed to download submission geojson.',
            variant: 'error',
            duration: 2000,
          }),
        );
        dispatch(ProjectActions.SetDownloadSubmissionGeojsonLoading(false));
      } finally {
        dispatch(ProjectActions.SetDownloadSubmissionGeojsonLoading(false));
      }
    };
    await downloadSubmissionGeojson(url);
  };
};
