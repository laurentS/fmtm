import React, { useEffect, useRef, useState } from 'react';
import AssetModules from '@/shared/AssetModules.js';
import { CustomSelect } from '@/components/common/Select.js';
import windowDimention from '@/hooks/WindowDimension';
import Table, { TableHeader } from '@/components/common/CustomTable';
import { SubmissionFormFieldsService, SubmissionTableService } from '@/api/SubmissionService';
import CoreModules from '@/shared/CoreModules.js';
import environment from '@/environment';
import { SubmissionsTableSkeletonLoader } from '@/components/ProjectSubmissions/ProjectSubmissionsSkeletonLoader.js';
import { Loader2 } from 'lucide-react';
import { SubmissionActions } from '@/store/slices/SubmissionSlice';
import { reviewStateData } from '@/constants/projectSubmissionsConstants';
import CustomDatePicker from '@/components/common/CustomDatePicker';
import { format } from 'date-fns';
import Button from '../common/Button';

type filterType = {
  task_id: number | null;
  submitted_by: string;
  review_state: string | null;
  submitted_date: string | null;
};

const SubmissionsTable = ({ toggleView }) => {
  const initialFilterState = {
    task_id: null,
    submitted_by: '',
    review_state: null,
    submitted_date: null,
  };
  const [filter, setFilter] = useState<filterType>(initialFilterState);
  const { windowSize } = windowDimention();
  const dispatch = CoreModules.useAppDispatch();
  const params = CoreModules.useParams();
  const encodedId = params.projectId;
  const decodedId = environment.decode(encodedId);
  const submissionFormFields = CoreModules.useAppSelector((state) => state.submission.submissionFormFields);
  const submissionTableData = CoreModules.useAppSelector((state) => state.submission.submissionTableData);
  const submissionFormFieldsLoading = CoreModules.useAppSelector(
    (state) => state.submission.submissionFormFieldsLoading,
  );
  const submissionTableDataLoading = CoreModules.useAppSelector((state) => state.submission.submissionTableDataLoading);
  const submissionTableRefreshing = CoreModules.useAppSelector((state) => state.submission.submissionTableRefreshing);
  const taskInfo = CoreModules.useAppSelector((state) => state.task.taskInfo);
  const [paginationPage, setPaginationPage] = useState<number>(1);
  const [submittedBy, setSubmittedBy] = useState<string>('');

  const updatedSubmissionFormFields = submissionFormFields?.map((formField) => {
    if (formField.type !== 'structure') {
      return {
        ...formField,
        path: formField?.path.slice(1).replace(/\//g, '.'),
        name: formField?.name.charAt(0).toUpperCase() + formField?.name.slice(1).replace(/_/g, ' '),
      };
    }
    return null;
  });

  useEffect(() => {
    dispatch(
      SubmissionFormFieldsService(`${import.meta.env.VITE_API_URL}/submission/submission_form_fields/${decodedId}`),
    );
  }, []);

  useEffect(() => {
    if (!filter.task_id) {
      dispatch(
        SubmissionTableService(`${import.meta.env.VITE_API_URL}/submission/submission_table/${decodedId}`, {
          page: paginationPage,
          ...filter,
        }),
      );
    } else {
      dispatch(
        SubmissionTableService(`${import.meta.env.VITE_API_URL}/submission/task_submissions/${decodedId}`, {
          page: paginationPage,
          ...filter,
        }),
      );
    }
  }, [filter, paginationPage]);

  useEffect(() => {
    setPaginationPage(1);
  }, [filter]);

  const refreshTable = () => {
    dispatch(
      SubmissionFormFieldsService(`${import.meta.env.VITE_API_URL}/submission/submission_form_fields/${decodedId}`),
    );
    dispatch(SubmissionActions.SetSubmissionTableRefreshing(true));
    if (!filter.task_id) {
      dispatch(
        SubmissionTableService(`${import.meta.env.VITE_API_URL}/submission/submission_table/${decodedId}`, {
          page: paginationPage,
          ...filter,
        }),
      );
    } else {
      dispatch(
        SubmissionTableService(`${import.meta.env.VITE_API_URL}/submission/task_submissions/${decodedId}`, {
          page: paginationPage,
          ...filter,
        }),
      );
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilter((prev) => ({ ...prev, submitted_by: submittedBy }));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [submittedBy, 500]);

  const handleChangePage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>,
    newPage: number,
  ) => {
    if (newPage + 1 > submissionTableData?.pagination?.pages || newPage + 1 < 1) {
      setPaginationPage(paginationPage);
      return;
    }
    setPaginationPage(newPage + 1);
  };

  const clearFilters = () => {
    setFilter(initialFilterState);
  };

  function getValueByPath(obj: any, path: string) {
    let value = obj;
    path?.split('.')?.map((item) => {
      if (path === 'start' || path === 'end') {
        value = `${value[item]?.split('T')[0]} ${value[item]?.split('T')[1]}`;
      } else if (item === 'point') {
        value = `${value[item].type} (${value[item].coordinates})`;
      } else {
        value = value[item];
      }
    });
    return value ? value : '-';
  }

  return (
    <div className="">
      <div className="fmtm-flex xl:fmtm-items-end xl:fmtm-justify-between fmtm-flex-col xl:fmtm-flex-row fmtm-gap-4 fmtm-mb-6">
        <div
          className={`${
            windowSize.width < 2000 ? 'fmtm-w-full md:fmtm-w-fit' : 'fmtm-w-fit'
          } fmtm-flex xl:fmtm-items-end fmtm-gap-2 xl:fmtm-gap-4 fmtm-rounded-lg fmtm-relative fmtm-flex-col xl:fmtm-flex-row `}
        >
          <div className="fmtm-grid fmtm-grid-cols-2 sm:fmtm-grid-cols-3 md:fmtm-grid-cols-4 lg:fmtm-grid-cols-5 fmtm-gap-4 fmtm-items-end">
            <div className={`${windowSize.width < 500 ? 'fmtm-w-full' : 'fmtm-w-[11rem]'}`}>
              <CustomSelect
                title="Task Id"
                placeholder="Select"
                data={taskInfo}
                dataKey="value"
                value={filter?.task_id?.toString() || null}
                valueKey="task_id"
                label="task_id"
                onValueChange={(value) => value && setFilter((prev) => ({ ...prev, task_id: +value }))}
                className="fmtm-text-grey-700 fmtm-text-sm !fmtm-mb-0 fmtm-bg-white"
              />
            </div>
            <div className={`${windowSize.width < 500 ? 'fmtm-w-full' : 'fmtm-w-[11rem]'}`}>
              <CustomSelect
                title="Review State"
                placeholder="Select"
                data={reviewStateData}
                dataKey="value"
                value={filter?.review_state}
                valueKey="value"
                label="label"
                onValueChange={(value) => value && setFilter((prev) => ({ ...prev, review_state: value.toString() }))}
                errorMsg=""
                className="fmtm-text-grey-700 fmtm-text-sm !fmtm-mb-0 fmtm-bg-white"
              />
            </div>
            <div className={`${windowSize.width < 500 ? 'fmtm-w-full' : 'fmtm-w-[11rem]'}`}>
              <CustomDatePicker
                title="Submitted Date"
                selectedDate={filter?.submitted_date}
                setSelectedDate={(date) =>
                  setFilter((prev) => ({ ...prev, submitted_date: format(new Date(date), 'yyyy-MM-dd') }))
                }
                className="fmtm-text-grey-700 fmtm-text-sm !fmtm-mb-0 fmtm-w-full"
              />
            </div>
            <div className={`${windowSize.width < 500 ? 'fmtm-w-full' : 'fmtm-w-[11rem]'}`}>
              <p className={`fmtm-text-grey-700 fmtm-text-sm fmtm-font-semibold !fmtm-bg-transparent`}>Submitted By</p>
              <div className="fmtm-border fmtm-border-gray-300 sm:fmtm-w-fit fmtm-flex fmtm-bg-white fmtm-items-center fmtm-px-1">
                <input
                  type="search"
                  className="fmtm-h-[1.9rem] fmtm-p-2 fmtm-w-full fmtm-outline-none"
                  placeholder="Search User"
                  onChange={(e) => setSubmittedBy(e.target.value)}
                ></input>
                <i className="material-icons fmtm-text-[#9B9999] fmtm-cursor-pointer">search</i>
              </div>
            </div>
            <Button
              btnText="Reset Filter"
              btnType="other"
              className={`${
                submissionTableDataLoading || submissionFormFieldsLoading ? '' : 'fmtm-bg-white'
              } !fmtm-text-base !fmtm-font-bold !fmtm-rounded`}
              onClick={clearFilters}
              disabled={submissionTableDataLoading || submissionFormFieldsLoading}
            />
          </div>
        </div>
        <div className="fmtm-w-full fmtm-flex fmtm-justify-end -fmtm-order-1 xl:fmtm-order-2 xl:fmtm-w-fit fmtm-gap-3">
          <button
            className={`fmtm-px-4 fmtm-py-1 fmtm-flex fmtm-items-center fmtm-w-fit fmtm-rounded fmtm-gap-2 fmtm-duration-150 ${
              submissionTableDataLoading || submissionFormFieldsLoading
                ? 'fmtm-bg-gray-400 fmtm-cursor-not-allowed'
                : 'fmtm-bg-primaryRed hover:fmtm-bg-red-700'
            }`}
            onClick={refreshTable}
            disabled={submissionTableDataLoading || submissionFormFieldsLoading}
          >
            {(submissionTableDataLoading || submissionFormFieldsLoading) && submissionTableRefreshing ? (
              <Loader2 className="fmtm-h-4 fmtm-w-4 fmtm-animate-spin fmtm-text-white" />
            ) : (
              <AssetModules.ReplayIcon className="fmtm-text-white" style={{ fontSize: '18px' }} />
            )}
            <p className="fmtm-text-white fmtm-text-base">REFRESH</p>
          </button>
          {toggleView}
        </div>
      </div>
      {submissionTableDataLoading || submissionFormFieldsLoading ? (
        <SubmissionsTableSkeletonLoader />
      ) : (
        <Table data={submissionTableData?.results || []} flag="dashboard" onRowClick={() => {}} isLoading={false}>
          <TableHeader
            dataField="SN"
            headerClassName="snHeader"
            rowClassName="snRow"
            dataFormat={(row, _, index) => <span>{index + 1}</span>}
          />
          {updatedSubmissionFormFields?.map((field: any): React.ReactNode | null => {
            if (field) {
              return (
                <TableHeader
                  key={field?.path}
                  dataField={field?.name}
                  headerClassName="codeHeader"
                  rowClassName="codeRow"
                  dataFormat={(row) => (
                    <div
                      className="fmtm-w-[7rem] fmtm-overflow-hidden fmtm-truncate"
                      title={getValueByPath(row, field?.path)}
                    >
                      <span className="fmtm-text-[15px]">{getValueByPath(row, field?.path)}</span>
                    </div>
                  )}
                />
              );
            }
            return null;
          })}
          <TableHeader
            dataField="Actions"
            headerClassName="updatedHeader"
            rowClassName="updatedRow"
            dataFormat={(row) => (
              <div className="fmtm-w-[7rem] fmtm-overflow-hidden fmtm-truncate fmtm-text-center">
                <AssetModules.VisibilityOutlinedIcon className="fmtm-text-[#545454]" />{' '}
                <span className="fmtm-text-primaryRed fmtm-border-[1px] fmtm-border-primaryRed fmtm-mx-1"></span>{' '}
                <AssetModules.CheckOutlinedIcon className="fmtm-text-[#545454]" />{' '}
                <span className="fmtm-text-primaryRed fmtm-border-[1px] fmtm-border-primaryRed fmtm-mx-1"></span>{' '}
                <AssetModules.DeleteIcon className="fmtm-text-[#545454]" />
              </div>
            )}
          />
        </Table>
      )}
      {submissionTableData?.pagination && (
        <div
          style={{ fontFamily: 'BarlowMedium' }}
          className="fmtm-flex fmtm-items-center fmtm-justify-end fmtm-gap-2 sm:fmtm-gap-4"
        >
          <CoreModules.TablePagination
            component="div"
            count={submissionTableData?.pagination?.total}
            page={submissionTableData?.pagination?.page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={submissionTableData?.pagination?.per_page}
            rowsPerPageOptions={[]}
            backIconButtonProps={{
              disabled:
                submissionTableDataLoading || submissionFormFieldsLoading || !submissionTableData?.pagination?.prev_num,
            }}
            nextIconButtonProps={{
              disabled:
                submissionTableDataLoading || submissionFormFieldsLoading || !submissionTableData?.pagination?.next_num,
            }}
            sx={{
              '&.MuiTablePagination-root': {
                display: 'flex',
                justifyContent: 'flex-end',
              },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: 'black',
                },
              },
              '&.Mui-focused .MuiFormLabel-root-MuiInputLabel-root': {
                color: 'black',
              },
              '.MuiTablePagination-spacer': { display: 'none' },
              '.MuiTablePagination-actions': {
                display: 'flex',
                '.MuiIconButton-root': { width: '30px', height: '30px' },
              },
            }}
            onRowsPerPageChange={() => {}}
          />
          <p className="fmtm-text-sm">Jump to</p>
          <input
            type="number"
            className={`fmtm-border-[1px] fmtm-border-[#E7E2E2] fmtm-text-sm fmtm-rounded-sm fmtm-w-11 fmtm-outline-none ${
              submissionTableDataLoading || (submissionFormFieldsLoading && 'fmtm-cursor-not-allowed')
            }`}
            onKeyDown={(e) => {
              if (e.currentTarget.value) {
                handleChangePage(e, parseInt(e.currentTarget.value) - 1);
              }
            }}
            disabled={submissionTableDataLoading || submissionFormFieldsLoading}
          />
        </div>
      )}
    </div>
  );
};

export default SubmissionsTable;