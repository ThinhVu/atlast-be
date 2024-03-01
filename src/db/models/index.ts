import {getColl} from "../../plugins/mongodb";
import {IAdminUser} from "./admin-user";
import {IAnnouncement} from "./announcement";
import {IAppMetric} from "./metric/app-metric";
import {IDbMigrateHistory} from "./db-migrate-history";
import {IFile} from "./file-system/file";
import {IFolder} from "./file-system/folder";
import {IHealthCheck} from "./health-check";
import {II18n} from "./i18n";
import {IKV} from "./kv";
import {INotification} from "./notification";
import {ITask} from "./tasks";
import {IUser} from "./user";
import {IVerification} from "./verification";
import {IDbUsageHistory} from "./db-usage-history"
import {IDbApiKey} from "./db-api-key"
import {IDatabase} from "./database"
import {IUsageMetric} from "./metric/usage-metric"
import {IMongoStats} from "./metric/mongostats"
import {IMongoTop} from "./metric/mongotop"

export const CollNames = {
  AdminUsers: 'adminusers',
  Announcements: 'announcements',
  ApiMetrics: 'apimetrics',
  AppMetrics: 'appmetrics',
  DbMigrateHistories: 'dbmigratehistories',
  Files: 'files',
  Folders: 'folders',
  HealthChecks: 'healthchecks',
  I18ns: 'i18ns',
  KVs: 'kvs',
  Notifications: 'notifications',
  Tasks: 'tasks',
  UserMetrics: 'usermetrics',
  Users: 'users',
  Verifications: 'verifications',
  DbUsageHistory: 'usagehistory',
  DbApiKey: 'dbapikey',
  Database: 'database',
  UsageMetric: 'usagemetric',
  MongoStats: 'mongostats',
  MongoTop: 'mongotop',
};

export const Model = {
  get AdminUsers() {
    return getColl<IAdminUser>(CollNames.AdminUsers)
  },
  get Announcements() {
    return getColl<IAnnouncement>(CollNames.Announcements)
  },
  get AppMetrics() {
    return getColl<IAppMetric>(CollNames.AppMetrics)
  },
  get DbMigrateHistories() {
    return getColl<IDbMigrateHistory>(CollNames.DbMigrateHistories)
  },
  get Files() {
    return getColl<IFile>(CollNames.Files)
  },
  get Folders() {
    return getColl<IFolder>(CollNames.Folders)
  },
  get HealthChecks() {
    return getColl<IHealthCheck>(CollNames.HealthChecks)
  },
  get I18ns() {
    return getColl<II18n>(CollNames.I18ns)
  },
  get KVs() {
    return getColl<IKV>(CollNames.KVs)
  },
  get Notifications() {
    return getColl<INotification>(CollNames.Notifications)
  },
  get Tasks() {
    return getColl<ITask>(CollNames.Tasks)
  },
  get Users() {
    return getColl<IUser>(CollNames.Users)
  },
  get Verifications() {
    return getColl<IVerification>(CollNames.Verifications)
  },
  get DbUsageHistory() {
    return getColl<IDbUsageHistory>(CollNames.DbUsageHistory)
  },
  get DbApiKey() {
    return getColl<IDbApiKey>(CollNames.DbApiKey)
  },
  get Database() {
    return getColl<IDatabase>(CollNames.Database)
  },
  get UsageMetric() {
    return getColl<IUsageMetric>(CollNames.UsageMetric)
  },
  get MongoStats() {
    return getColl<IMongoStats>(CollNames.MongoStats)
  },
  get MongoTop() {
    return getColl<IMongoTop>(CollNames.MongoTop)
  }
}