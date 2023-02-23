"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbRun = exports.dbGet = exports.dbAll = void 0;
const main_1 = require("../main");
function dbAll(sql, param) {
    return new Promise((resolve, reject) => main_1.client.db.all(sql, param, (err, rows) => {
        if (err) {
            reject(err);
        }
        else {
            resolve(rows);
        }
    }));
}
exports.dbAll = dbAll;
function dbGet(sql, param) {
    return new Promise((resolve, reject) => main_1.client.db.get(sql, param, (err, rows) => {
        if (err) {
            reject(err);
        }
        else {
            resolve(rows);
        }
    }));
}
exports.dbGet = dbGet;
function dbRun(sql, param) {
    return new Promise((resolve, reject) => main_1.client.db.run(sql, param, function (err) {
        if (err) {
            reject(err);
        }
        else {
            resolve(this.lastID);
        }
    }));
}
exports.dbRun = dbRun;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbWlzZVdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvcHJvbWlzZVdyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsa0NBQWlDO0FBRWpDLFNBQWdCLEtBQUssQ0FBSSxHQUFXLEVBQUUsS0FBK0I7SUFDbkUsT0FBTyxJQUFJLE9BQU8sQ0FBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLGFBQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDbkYsSUFBSSxHQUFHLEVBQUU7WUFDUCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDYjthQUFNO1lBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2Y7SUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVJELHNCQVFDO0FBRUQsU0FBZ0IsS0FBSyxDQUFJLEdBQVcsRUFBRSxLQUErQjtJQUNuRSxPQUFPLElBQUksT0FBTyxDQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsYUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUNqRixJQUFJLEdBQUcsRUFBRTtZQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNiO2FBQU07WUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDZjtJQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDO0FBUkQsc0JBUUM7QUFFRCxTQUFnQixLQUFLLENBQUMsR0FBVyxFQUFFLEtBQStCO0lBQ2hFLE9BQU8sSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxhQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFVBQVUsR0FBRztRQUNyRixJQUFJLEdBQUcsRUFBRTtZQUNQLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNiO2FBQU07WUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNOLENBQUM7QUFSRCxzQkFRQyJ9