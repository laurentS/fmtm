import React from 'react';
import CoreModules from '@/shared/CoreModules';
import CustomizedImage from '@/utilities/CustomizedImage';
import { useNavigate } from 'react-router-dom';
import { user_roles } from '@/types/enums';

const OrganisationGridCard = ({ filteredData, allDataLength }) => {
  const navigate = useNavigate();
  const authDetails = CoreModules.useAppSelector((state) => state.login.authDetails);
  const cardStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'row',
    cursor: 'pointer',
    gap: '20px',
    boxShadow: 'none',
    borderRadius: '0px',
  };
  return (
    <div>
      <p className="fmtm-text-[#9B9999]">
        Showing {filteredData?.length} of {allDataLength} organizations
      </p>
      <div className="fmtm-grid fmtm-grid-cols-1 md:fmtm-grid-cols-2 lg:fmtm-grid-cols-3 fmtm-gap-5">
        {filteredData?.map((data, index) => (
          <CoreModules.Card
            key={index}
            sx={cardStyle}
            onClick={() => {
              if (!data?.approved && authDetails && authDetails?.['role'] === user_roles.ADMIN) {
                navigate(`/approve-organization/${data?.id}`);
              }
            }}
          >
            {data.logo ? (
              <div className="fmtm-min-w-[60px] md:fmtm-min-w-[80px] lg:fmtm-min-w-[120px]">
                <CoreModules.CardMedia component="img" src={data.logo} sx={{ width: ['60px', '80px', '120px'] }} />
              </div>
            ) : (
              <div className="fmtm-min-w-[60px] fmtm-max-w-[60px] md:fmtm-min-w-[80px] md:fmtm-max-w-[80px] lg:fmtm-min-w-[120px] lg:fmtm-max-w-[120px]">
                <CustomizedImage status={'card'} style={{ width: '100%' }} />
              </div>
            )}

            <CoreModules.Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              className="fmtm-overflow-hidden fmtm-grow fmtm-h-full fmtm-justify-between"
            >
              <div className="fmtm-flex fmtm-flex-col fmtm-gap-1">
                <h2
                  className="fmtm-line-clamp-1 fmtm-text-base sm:fmtm-text-lg fmtm-font-bold fmtm-capitalize"
                  title={data.name}
                >
                  {data.name}
                </h2>
                <p
                  className="fmtm-line-clamp-3 fmtm-text-[#7A7676] fmtm-font-archivo fmtm-text-sm sm:fmtm-text-base"
                  title={data.description}
                >
                  {data.description}
                </p>
              </div>
              {authDetails && authDetails['role'] === user_roles.ADMIN && (
                <div className="fmtm-w-full fmtm-flex fmtm-justify-end">
                  <div
                    className={`fmtm-bottom-5 fmtm-right-5 fmtm-px-2 fmtm-py-1 fmtm-rounded fmtm-w-fit ${
                      data?.approved ? 'fmtm-text-[#40B449] fmtm-bg-[#E7F3E8]' : 'fmtm-bg-[#FBE2E2] fmtm-text-[#D33A38]'
                    }`}
                  >
                    <p className="fmtm-text-sm sm:fmtm-text-base">{data?.approved ? 'Verified' : 'Not Verified'}</p>
                  </div>
                </div>
              )}
            </CoreModules.Box>
          </CoreModules.Card>
        ))}
      </div>
    </div>
  );
};
export default OrganisationGridCard;
