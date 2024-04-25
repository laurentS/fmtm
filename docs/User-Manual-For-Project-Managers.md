# User Manual for FMTM

This manual is a step by step guide for the project managers on how to get
started with the Field Mapping Tasking Manager.

- [User Manual for FMTM](#user-manual-for-fmtm)
  - [Introduction](#introduction)
  - [An Overview Of FMTM In Relations With HOT, OSM and ODK](#an-overview-of-fmtm-in-relations-with-hot-osm-and-odk)
  - [Prerequisites](#prerequisites)
  - [Video Tutorial](#video-tutorial)
  - [Steps to create a project in FMTM](#steps-to-create-a-project-in-fmtm)
  - [Steps to start access your project and Start mapping or a mapping campaign](#steps-to-start-access-your-project-and-start-mapping-or-a-mapping-campaign)
  - [Help and Support](#help-and-support)
  - [Thank you](#thank-you)

## Introduction

A **Mapping Campaign** refers to an organized effort of collecting data
from a particular geographic area/feature and creating maps. This may
involve using various mapping technologies such as; GPS, satellite
imagery, or crowdsourced data. These technologies are used to gather
information about the area of interest.

Mapping campaigns can be carried out for lots of different purposes,
some examples are:

- Disaster Response and Recovery
- Environmental Conservation
- Urban planning or;
- Social and Political Activism.

They often involve collaboration between organizations like; Government
Agencies, Non-profit Groups and volunteers.

Once the data is collected, it is analyzed and processed to create
detailed maps that can have a variety of use cases. These could be:

- Identifying areas of need.
- Planning infrastructure and development projects.
- Understanding the impact of environmental changes on the landscape,
  etc.

## An Overview Of FMTM In Relations With HOT, OSM and ODK

The **Humanitarian OpenStreetMap Team (HOT**) is a non-profit
organization that uses open mapping data to support humanitarian and
disaster response efforts around the world. **The Field Mapping Task
Manager (FMTM)** is one of the tools that **HOT** used to coordinate and
manage mapping projects.

**FMTM** is a software tool that helps project managers to organize and
manage mapping tasks. It assigns those tasks to volunteers and tracks
their progress. The tool includes features for collaborative editing,
data validation, and error detection. This ensures that the data
collected by volunteers is accurate and reliable.

**FMTM** is designed to be used in conjunction with **ODK
(ODK)**. **ODK** is a free and open-source set of tools that allows
users to create, collect, and manage data with mobile devices. The
**ODK** provides a set of open-source tools that allow users to build
forms, collect data in the field, and aggregate data on a central
server. It is commonly used for data collection in research, monitoring
and evaluation, and other development projects.

Project managers use **FMTM** to manage tasks and assign them to
volunteers. The data collected by the volunteer via ODK is typically
uploaded to **OpenStreetMap (OSM)** where it is used to create more
detailed and accurate maps of the affected area. **OSM** is a free and
open-source map of the world that is created and maintained by
volunteers.

Overall, the **FMTM** tool is an important component of **HOT**'s
efforts to support disaster response and humanitarian efforts around the
world. By coordinating mapping activities and ensuring the accuracy and
reliability of the data collected by volunteers, **FMTM** helps to
provide critical information that can be used to support decision-making
and improve the effectiveness of humanitarian efforts.

## Prerequisites

- Stable Internet connection
- Knowledge on field mapping . If you are new to mapping we suggest you to read
  [this][9] .
- Account on ODK Central Server.
  [Here][10]
  are the instructions for setting up an ODK Central server on Digital Ocean
  (it's very similar on AWS etc)

## Video Tutorial

<https://github.com/hotosm/fmtm/assets/97789856/6ad200e7-3af9-418b-bb6e-6666bbab9a15>

<https://github.com/hotosm/fmtm/assets/97789856/62646dd8-6130-4612-99fe-4df29ae432d9>

<https://github.com/hotosm/fmtm/assets/97789856/8677062c-981c-4ea3-964f-3348c4953f82>

<https://github.com/hotosm/fmtm/assets/97789856/02355809-2f40-470c-856f-afe56250883f>

<https://github.com/hotosm/fmtm/assets/97789856/084ce707-95ba-4d51-a650-132be84fbe68>

<https://github.com/hotosm/fmtm/assets/97789856/6711badb-c93e-4109-9090-0ad1f1554699>

<https://github.com/hotosm/fmtm/assets/97789856/b2af3c7d-5392-4e10-bf83-853b2f517c9a>

<https://github.com/hotosm/fmtm/assets/97789856/d8b2bf72-e8e0-41bc-a568-77854f45efa6>

## Steps to create a project in FMTM

1. Go to [fmtm][11] .
2. In the header, you'll find two tabs: Explore Projects and Manage Organization.

   ![fmtm dashboard][12]

3. Start by exploring the projects listed by different nations and world
   communities for field mapping exercises.
4. Use the filters or search option to narrow down the project cards based on
   your preferences.

   ![project filters][13]

5. If you are not logged into the system, the "Create new project" button will
   be disabled.
6. If you are new then on the top right cornor click on Sign up and create an
   account . Else , Sign in to your existing account .
7. When you click on sign in, a pop-up will appear to ask if you want to sign in through your personal osm account or you want to use temporary account to sign in. You can select the options accordingly.
8. Once signed in, the "Create new project" button will be enabled. Click on it.
9. The process of creating a new project involves five steps: Project Details,
   Upload Area, Select Category, Data Extract and Split the tasks.
10. Start by filling in the project details, including the organization name,
    project name, description, and other relevant information.

![project details 2][14]

11. If your organization's name is not listed, you can add it through the
    "Manage Organization" tab.
12. Provide the necessary credentials for the ODK (ODK) central setup,
    including URL, username, and password.
13. Also, If you want to upload custom tile for baslayer, you can also add TMS URL by ticking on the checkbox asking "Will you use a custom TMS basemap"
14. Proceed to the next step, which is uploading the area for field mapping.
    Choose the file option and select the AOI (Area of Interest) file in GEOJSON
    file format. You can also draw the AOI from map on the right side of that page.
    Review the displayed map that corresponds to your selected area and click
    on "Next".

    ![project create info][15]

15. In the third step, You should select the category on which you want to perform field mapping like buildings, health, waterways, Highways etc. You can also upload your custom XLS form for field mapping by ticking on upload custom Xform instead.

    ![project create area][16]

16. User can choose if they want to use osm data extract or upload custom data extract for their field mapping. 

    Click on "Next" to proceed.

    ![project task split][17]

17. The final step for project creation allows you to choose how you want to split your Area of Interest. You can either divide by square by providing the size of square boxes you want. Similarly, If your project area already contains divisions you can also use them as single task per polygon. 
You can also use task splitting algorithm which divides your area of interest into tasks by average number of building features you want per tasks. 
    Click on "Submit" to proceed.

    ![project creation status][18]

18. Wait for the system to generate QR codes for each task, which will be used
    later in the field mapping process.
19. After the QR codes are generated, you can find your project in the project
    dashboard.

## Steps to start access your project and Start mapping or a mapping campaign

1. Go to the Explore projects tab . Click on the project card and proceed to the
   next step.
2. Select one of the available tasks and start the field mapping exercise.

   ![select task][19]

3. If a task is already locked by another user, choose a different task that is
   available for mapping.

   - The drop down icon beside **LEGEND** displays a color code. This
     color code lets you know the status of each task on the map.

     - **READY** means that task is available to be mapped
     - **LOCKED FOR MAPPING** means that task is already being mapped by another
       volunteer and therefore unavailable for mapping
     - **MAPPED** or **READY FOR VALIDATION** means that task has been completely
       mapped and ready to be validated.
     - **LOCKED FOR VALIDATION** means that task has been mapped and being
       validated.
     - **VALIDATED** means that task has successfully been validated and completely
       mapped with no errors
     - **INVALIDATED** or **MORE MAPPING NEEDED** means that task did not pass the
       validation process and needs more mapping
     - **BAD** means that task is not clear and cannot be mapped

   > Note: 'task' refers to each section of the map enclosed in the dotted
   > lines and each task has a corresponding number tag.

   ![map legend][20]

   - To begin mapping, click on a task closest to you that has the color
     code associated with **READY** and change it's status from **READY**
     to **LOCKED FOR MAPPING**. Remember to take note of the number tag.
   - The **ACTIVITIES** tab shows the
     tasks either **LOCKED FOR MAPPING**, **BAD** or **LOCKED FOR
     VALIDATION**. You can search for tasks with the status mentioned
     using the number tag associated with each task.

4. Use the QR code to start mapping the selected task using the ODK Collect app
   on your mobile phone.
5. Install and open the ODK Collect app on your phone.
6. Set up the project details by scanning the QR code provided.
7. Once the project is set up in the app, start a new form based on the selected
   form from the project setup.
8. Fill in the questionnaires and collect data for the field mapping exercise.
9. Save and send the completed form to the server.
10. After completing the assigned task, go back to the project platform on FMTM
    and mark it as fully mapped.

## Help and Support

If you encounter any issues or need assistance while using FMTM, you can access
the following resources:

- Check the [FAQs][21] .
- Ask your doubts in the [Slack channel: #fmtm-field-pilots][22]

## Thank you

We are excited to have you join our community of passionate mappers and
volunteers. FMTM is a powerful platform developed by the Humanitarian
OpenStreetMap Team (HOT) to facilitate mapping projects for disaster response,
humanitarian efforts, and community development.

With FMTM, you have the opportunity to make a real impact by mapping areas that
are in need of support. Your contributions help create detailed and up-to-date
maps that aid organizations and communities in their efforts to respond to
crises, plan infrastructure, and improve the lives of people around the world.

Whether you are a seasoned mapper or new to the world of mapping, FMTM provides
a user-friendly interface and a range of tools to make your mapping experience
smooth and rewarding. You can create tasks, collaborate with other volunteers,
and contribute to ongoing projects that align with your interests and expertise.

By mapping with FMTM, you are joining a global community of dedicated
individuals who share a common goal of using open data to make a positive
difference. Together, we can create a more resilient and inclusive world.

Explore the projects, join tasks, and contribute your skills to help us build
accurate and comprehensive maps. Don't hesitate to ask questions, seek
guidance, and engage with fellow mappers through our forums and communication
channels.

Thank you for being part of FMTM. Your mapping efforts are invaluable, and we
appreciate your commitment to making a difference.

Happy mapping!

The FMTM Team

[9]: https://tasks.hotosm.org/learn/map "If you are new to mapping"
[10]: https://docs.getodk.org/central-install-digital-ocean/ "Account on ODK Central Server"
[11]: https://fmtm.hotosm.org/ "fmtm"
[12]: https://github.com/hotosm/fmtm/assets/97789856/c0d272f0-c69c-483f-9e9d-83dd75b9e748 "fmtm dashboard"
[13]: https://github.com/hotosm/fmtm/assets/97789856/a5d61628-70e6-426c-a860-b9c7968b4dea "project filters"
[14]: https://github.com/hotosm/fmtm/assets/97789856/97c38c80-aa0e-4fe2-b8a5-f4ee43a9a63a "project details 2"
[15]: https://github.com/hotosm/fmtm/assets/97789856/680eb831-790a-48f1-8997-c20b5213909d "project create info"
[16]: https://github.com/hotosm/fmtm/assets/97789856/177d8258-900e-447f-906a-28aeb1fd6b03 "project create area"
[17]: https://github.com/hotosm/fmtm/assets/97789856/f53d76b4-e6cc-44a4-8c7c-00082eb72693 "project task split"
[18]: https://github.com/hotosm/fmtm/assets/97789856/f9a4bed7-d1a9-44dd-b2d4-b55f428f9416 "project creation status"
[19]: https://github.com/hotosm/fmtm/assets/97789856/162af2e0-dbfa-4787-8037-f03e71417df8 "select task"
[20]: https://github.com/hotosm/fmtm/assets/97789856/2c0397b0-1829-420a-982e-3d971b514f2c "map legend"
[21]: https://hotosm.github.io/fmtm/FAQ "FAQs"
[22]: https://hotosm.slack.com/archives/C04PCBFDEGN "Slack channel: #fmtm-field-pilots"
