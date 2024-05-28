# Copyright (c) 2022, 2023 Humanitarian OpenStreetMap Team
#
# This file is part of FMTM.
#
#     FMTM is free software: you can redistribute it and/or modify
#     it under the terms of the GNU General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     FMTM is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU General Public License for more details.
#
#     You should have received a copy of the GNU General Public License
#     along with FMTM.  If not, see <https:#www.gnu.org/licenses/>.
#

"""Task dependencies for use in Depends."""

from typing import Union

from fastapi import Depends
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.db_models import DbProject
from app.models.enums import HTTPStatus


async def get_xform_name(
    project: Union[int, DbProject],
    task_id: int,
    db: Session = Depends(get_db),
) -> str:
    """Get a single project by id."""
    if isinstance(project, int):
        db_project = db.query(DbProject).filter(DbProject.id == project).first()
        if not db_project:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail=f"Project with ID ({project}) does not exist",
            )
    else:
        db_project = project

    project_name = db_project.project_name_prefix
    # TODO in the future we may possibly support multiple forms per project.
    # TODO to facilitate this we need to add the _{category} suffix and track.
    # TODO this in the new xforms.category field/table.
    form_name = project_name
    return form_name
