<template>
    <div>
        <Processes ref="processes" :processes="processes" @startProcess="startProcess" @loadProcess="loadProcessDefinition" />
        <MyTasks :tasks="assignedTasks" @updateAssignment="updateAssignment" @completeTask="completeTask" @loadProcess="loadProcessDefinition" />
        <GroupTasks :tasks="availableTasks" @updateAssignment="updateAssignment" @loadProcess="loadProcessDefinition" />
    </div>
</template>

<script>
import { each, first, isEmpty, isUndefined, merge, reject } from "lodash";
import axios from "axios";
import GroupTasks from "./workflow/GroupTasks";
import MyTasks from "./workflow/MyTasks";
import Processes from "./workflow/Processes";

/**
 * @description Controlling file for loading the three different parts of workflow (available tasks, available processes, and tasks assigned to you).
 *
 * @fires POST /workflow/taskinstance/ID?_action=complete - Call used to save a task, the expected data is based on the configured workflow
 * @fires PUT  /workflow/taskinstance/ID - Assigns a user to an already created task, expected input is a assignee ID
 * @fires GET /endpoint/gettasksview - Get task view information (based on workflow configuration)
 * @fires POST  /workflow/processinstance/?_action=create - Create or start a new task (based on how workflow is configured)
 * @fires GET  /endpoint/getprocessesforuser- Returns all the current task instances assigned to the user currently logged in
 * @fires GET /workflow/processdefinition/ID - Gets the details for the process definition (based on workflow configuration)
 *
 */
export default {
    "name": "Workflow-Control-Widget",
    // eslint-disable-next-line sort-keys
    "components": {
        GroupTasks,
        MyTasks,
        Processes
    },
    data () {
        return {
            "assignedTasks": {},
            "availableTasks": {},
            "processes": {},
            "workflowService": null
        };
    },
    // eslint-disable-next-line sort-keys
    created () {
        this.workflowService = this.getRequestService();
        this.loadData();
    },
    "methods": {
        completeTask ({ id, formData }) {
            /* istanbul ignore next */
            return this.workflowService.post(`/workflow/taskinstance/${id}?_action=complete`, formData, {
                "headers": { "Accept": "application/json, text/javascript, */*; q=0.01" }
            }).
                then((response) => {
                    this.displayNotification("success", this.$t("pages.workflow.taskSuccessfullyCompleted"));
                    this.$delete(this.assignedTasks, id);
                }).
                then(this.loadData).
                catch((error) => {
                    if (error.response.data.code === 403) {
                        this.displayNotification("error", this.$t("pages.workflow.taskNoLongerAvailable", { "taskName": this.assignedTasks[id].name }));
                        this.$delete(this.assignedTasks, id);
                        this.loadTasks();
                    } else {
                        this.displayNotification("error", error.response.data.message);
                    }
                });
        },
        getTaskGroup (groupName) {
            return this[groupName];
        },
        getTaskParams (userId, groupName) {
            const parameters = {
                "_queryId": "gettasksview",
                userId
            };

            if (groupName === "assignedTasks") {
                parameters.viewType = "assignee";
            }

            return parameters;
        },
        loadData () {
            /* istanbul ignore next */
            // Need to load processes first so process definitions are available to tasks when loaded
            this.loadProcesses().
                then(() => axios.all([this.loadTasks({ "groupName": "assignedTasks" }), this.loadTasks({ "groupName": "availableTasks" })])).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        },
        loadProcessDefinition (process) {
            /* istanbul ignore next */
            process.fetchProcessDefinition().
                then(({ data }) => {
                    this.$set(process, "processDefinition", data);
                }).
                catch((error) => {
                    this.displayNotification("error", error.reponse.data.message);
                });
        },
        loadProcesses () {
            /* istanbul ignore next */
            return this.workflowService.get("/endpoint/getprocessesforuser").
                // Grab the array of processes off the response object.
                then((processes) => processes.data.processes).
                // Get the process definition for each process object
                then((processes) => axios.all(processes.map((process) => {
                    // eslint-disable-next-line no-underscore-dangle
                    const fetchProcessDefinition = () => this.workflowService.get(`/workflow/processdefinition/${process._id}`),
                        processDefinition = null;
                    return merge(process, { fetchProcessDefinition, processDefinition });
                }))).
                // Use the built in `$set` function to reactively get the process definitions into component state
                then((processDefinitions) => {
                    processDefinitions.forEach((definition) => {
                        // eslint-disable-next-line no-underscore-dangle
                        this.$set(this.processes, definition._id, definition);
                    });
                });
        },
        loadTasks (options = { "groupName": "availableTasks" }) {
            /* istanbul ignore next */
            return this.workflowService.get("/endpoint/gettasksview", {
                "params": this.getTaskParams(this.userDetails.userId, options.groupName)
            }).then((response) => {
                this.toTasks(this.getTaskGroup(options.groupName), response);
            });
        },
        startProcess (payload) {
            /* istanbul ignore next */
            return this.workflowService.post("/workflow/processinstance/?_action=create", payload).
                then((response) => {
                    this.displayNotification("success", this.$t("pages.workflow.processStartSuccessMessage"));
                    // eslint-disable-next-line no-underscore-dangle
                    this.$refs.processes.cancel(payload._processDefinitionId);
                }).
                then(this.loadData).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        },
        toTasks (taskGroup, { data }) {
            // Filter out any empty results
            const [tasks] = reject(data.result, isEmpty);

            // Process each result
            each(tasks, (taskObject, id) => {
                const { name } = taskObject,
                    task = first(taskObject.tasks),
                    // eslint-disable-next-line sort-vars
                    fetchProcessDefinition = () => this.workflowService.get(`/workflow/processdefinition/${task.processDefinitionId}`),
                    // eslint-disable-next-line sort-vars
                    process = isUndefined(this.processes[task.processDefinitionId]) ? { fetchProcessDefinition } : this.processes[task.processDefinitionId];

                // Use $set to maintain reactivity
                this.$set(taskGroup, id, { name, process, task });
            });
        },
        updateAssignment ({ id, task, assignee }) {
            /* istanbul ignore next */
            // eslint-disable-next-line no-underscore-dangle
            return this.workflowService.put(`/workflow/taskinstance/${task._id}`, { assignee }, { "headers": { "If-Match": "\"*\"" } }).
                then((response) => {
                    this.displayNotification("success", this.$t("pages.workflow.assignmentSuccess", { assignee, "taskName": task.name }));
                    // Use $delete to remove the task from the list to get the proper transition
                    this.$delete(this.assignedTasks, id);
                    this.$delete(this.availableTasks, id);
                }).
                then(this.loadData).
                catch((error) => {
                    if (error.response.data.code === 403) {
                        this.displayNotification("error", this.$t("pages.workflow.taskNoLongerAvailable", { "taskName": this.availableTasks[id].name }));
                        this.$delete(this.availableTasks, id);
                        this.loadTasks();
                    } else {
                        this.displayNotification("error", error.response.data.message);
                    }
                });
        }
    },
    "props": ["userDetails", "widgetDetails"]
};
</script>

<style lang="scss" scoped></style>
