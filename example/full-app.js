/* global BUS, STATE, FIELDS, updatedata, makeobject */

var CACHE = {}

var BASEURL = 'http://example.com/api'

var MONTHS = 'jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec'.split(',')

var screens = {

  viewdepartments: {
    title: 'Departments',
    weight: 0,
    tableview: {
      type: 'table',
      // datasource: the name of data source of this table, after this table is defined
      // you can set table contents using:
      //   BUS.emit('gui', 
      //      {
      //         op: 'updatedatasource', name: 'departmentstable',
      //         value: [
      //           ['Name', 'Family Name'],
      //           ['Mohamed', 'Adel'],
      //           ...
      //         ],
      //         rawdata: [
      //           ['id', 'name', 'family_name'],
      //           [1, 'mohamed', 'adel'],
      //           ...
      //         ]
      //      }
      //   )
      //  
      // "value" is what should be displayed in the table, "rawdata" is the raw data of this row
      // the operations below will use rawdata
      datasource: 'departmentstable',
      // operations define the operations the user can do on each row
      // each operation has a callback that expects a `row` argument which is take from rawdata
      operations: [
        { title: 'Edit',
          callback: function (row) {
            if (STATE.account.subscriptionrole != 'principal') {
              BUS.emit('gui', { op: 'notify', status: 'info', message: 'only the HR manager can edit' })
              return
            }
            console.debug('editing department', row)
            var obj = makeobject(FIELDS.departments, row)

            BUS.emit('gui', { op: 'gotoscreen', screen: 'editdepartment' })
            BUS.emit('gui', { op: 'fillform', values: obj })
            STATE.editedobjectid = obj.id

            return false
          } }
      ] },
    isvisible: function () { return !!STATE.account.password },
    adddepartmentbutton: { type: 'button',
      label: 'New Department',
      onclick: function () {
        if (STATE.account.subscriptionrole != 'principal') {
          BUS.emit('gui', { op: 'notify', status: 'info', message: 'only the HR manager can edit' })
          return
        }

        BUS.emit('gui', { op: 'gotoscreen', screen: 'adddepartment' })
      } }
    // isvisible: function() {return STATE.account.subscriptionrole=='principal'}
  },
  viewemployees: {
    title: 'Employees',
    weight: 1,
    tableview: { type: 'table',
      'datasource': 'employeestable',
      operations: [
        { title: 'Edit',
          callback: function (row) {
            if (STATE.account.subscriptionrole != 'principal') {
              BUS.emit('gui', { op: 'notify', status: 'info', message: 'only the HR manager can edit' })
              return
            }
            var obj = makeobject(FIELDS.employees, row)
            // add custom fields
            var cfields = getcustomfields(obj)
            for (var f in cfields) obj['custom_' + f] = cfields[f]
            console.debug('editing employee', obj)
            BUS.emit('gui', { op: 'gotoscreen', screen: 'editemployee' })
            BUS.emit('gui', { op: 'fillform', values: obj })
            STATE.editedobjectid = obj.id
            return false
          } },
        { title: 'Profile',
          callback: function (row) {
            var obj = makeobject(FIELDS.employees, row)
            BUS.emit('gui', { op: 'modal', content: makeemployeeprofile(obj) })
            return false
          } },
        { title: 'Terminate',
          callback: function (row) {
            if (STATE.account.subscriptionrole != 'principal') {
              BUS.emit('gui', { op: 'notify', status: 'info', message: 'only the HR manager can terminate' })
              return
            }
            var obj = makeobject(FIELDS.employees, row)
            console.debug(obj)
            var name = obj.fname + ' ' + obj.lname

            if (obj.employeestatus && obj.employeestatus.indexOf('TERMINATED') === 0) {
              BUS.emit('gui', { op: 'notify', status: 'error', message: 'employee already terminated' })
              return
            }

            // console.debug('terminating employee', obj)
            BUS.emit('gui', { op: 'gotoscreen', screen: 'terminateemployee' })
            BUS.emit('gui', { op: 'fillform', values: { name: name } })
            STATE.employeetoterminate = obj
            return false
          } }
      ] },
    isvisible: function () { return !!STATE.account.password },
    addemployee: { type: 'button',
      label: 'New Employee',
      onclick: function () {
        if (STATE.account.subscriptionrole != 'principal') {
          BUS.emit('gui', { op: 'notify', status: 'info', message: 'only the HR manager can edit' })
          return
        }

        BUS.emit('gui', { op: 'gotoscreen', screen: 'addemployee' })
      } }
  },
  viewpayroll: {
    title: 'Payroll',
    weight: 2,
    month: { type: 'date',
      label: 'Month',
      onchange: function (v) {
        STATE.payrollmonth = v.substring(0, 7) // yyyy-mm
      },
      options: MONTHS },
    tableview: { type: 'table', 'datasource': 'employeespayroll' },
    isvisible: function () { return false /* STATE.account.subscriptionrole=='principal' */ },
    payslipbutton: { type: 'button', label: 'Generate Payslips', onclick: function (data) { generatepayslip() } }
  },
  viewleaverequests: {
    title: 'Leave Requests',
    weight: 3,
    tableview: { type: 'table',
      'datasource': 'employeeleaverequests',
      operations: [
        { title: 'Approve',
          callback: function (row) {
            row = CACHE.leaverequests.filter((r) => r[0] == row[0])[0]
            var obj = makeobject(FIELDS.leaverequests, row)
            updateleaverequeststatus(obj, 'a')
            return false
          } },
        { title: 'Decline',
          callback: function (row) {
            row = CACHE.leaverequests.filter((r) => r[0] == row[0])[0]
            var obj = makeobject(FIELDS.leaverequests, row)
            updateleaverequeststatus(obj, 'd')
            return false
          } }

      ] },

    addleaverequest: { type: 'button',
      label: 'New Leave Request',
      onclick: function () {
        if (STATE.account.subscriptionrole == 'principal') {
          BUS.emit('gui', { op: 'notify', status: 'info', message: 'You are the HR manager, please create a regular user for yourself as employee and use it for employee functions (e.g. leave requests)' })
          return
        }
        BUS.emit('gui', { op: 'gotoscreen', screen: 'addleaverequest' })
      } },

    isvisible: function () { return !!STATE.account.password }
  },
  viewappraisals: {
    title: 'Appraisals',
    weight: 4,
    tableview: { type: 'table',
      'datasource': 'employeeappraisals',
      operations: [
        { title: 'Evaluate',
          callback: function (row) {
            var obj = makeobject(FIELDS.appraisals, row)
            BUS.emit('gui', { op: 'gotoscreen', screen: 'giveappraisal' })
            BUS.emit('gui', { op: 'fillform', values: obj })
            return false
          } }
      ] },

    isvisible: function () { return !!STATE.account.password },
    addappraisalbutton: { type: 'button',
      label: 'New Appraisal',
      onclick: function () {
        if (STATE.account.subscriptionrole != 'principal') {
          BUS.emit('gui', { op: 'notify', status: 'info', message: 'only the HR manager can edit' })
          return
        }

        BUS.emit('gui', { op: 'gotoscreen', screen: 'addappraisal' })
      } }

  },
  attendance: {
    title: 'Attendance',
    weight: 7,
    importdata: { type: 'localfile',
      label: 'Import Data',
      onload: function (e, f) {
      // BUS.emit('gui', {op: 'notify', status: 'info', message: 'Attendance not configured yet for your account, please contact the support'} )
      // return
        Papa.parse(f, { complete: function (r) {
          var fields = r.data[0].map((s) => s.toLowerCase())
          var data = r.data.slice(1)
          var F = 'id,in,out'.split(',')
          for (var i in F) {
            if (fields.join(',').indexOf(F[i]) >= 0) continue
            BUS.emit('gui', { op: 'notify', status: 'error', message: sprintf('expected column `%s` not found', F[i]) })
            return
          }

          // ok we have all columns now
          var topost = []
          for (var i in data) {
            var rec = makeobject(fields, data[i])
            // verify the employee exists
            if (rec.id.length == 0) continue

            var e = findemployeeby('id', rec.id)
            console.debug(e)
            if (!e) {
              BUS.emit('gui', { op: 'notify', status: 'error', message: sprintf('unknown employee id `%s`', rec.id) })
              return
            }

            var datein = moment(rec.in)
            if (!datein.isValid()) {
              BUS.emit('gui', { op: 'notify', status: 'error', message: sprintf('invalid date `%s`', rec.in) })
              return
            }

            var dateout = moment(rec.out)
            if (!dateout.isValid()) {
              BUS.emit('gui', { op: 'notify', status: 'error', message: sprintf('invalid date `%s`', rec.out) })
              return
            }

            topost.push({ employee: rec.id, in: datein.toISOString(), out: dateout.toISOString() })
          } // for each record

          // alert(topost)

          for (var i in topost) {
            BUS.emit('subscriptions-sendsignedrequest', {
              url: BASEURL + '/attendence',
              method: 'POST',
              payload: topost[i],
              callback: function (d) {
                if (d.code == 0) {
                  BUS.emit('gui', { op: 'notify', status: 'success', message: 'attendance record added successfully' })
                } else {
                  BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem adding attendance record' })
                }
              }
            })
          }

        // window.r = r
        // alert(r)
        } })
      } },
    isvisible: function () { return STATE.account.subscriptionrole == 'principal' }
  },
  adddepartment: {
    title: 'New Department',
    name: { type: 'input', label: 'Name' },
    code: { type: 'input', label: 'Code' },
    head: { type: 'select', label: 'Department Head', datasource: 'employeesoptions' },
    submit: { type: 'button', label: 'Add Department' },
    isvisible: function () { return false },
    submithandler: function (data) {
      var fields = 'name, code, head, description, startdate, timezone, businessunits'.split(', ')

      // fill missing values
      for (var f in fields) {
        if (f == 'id') continue
        if (!data[fields[f]]) data[fields[f]] = 0
      }

      if (STATE.editedobjectid) {
        data.id = STATE.editedobjectid
        STATE.editedobjectid = undefined
      } else {
        delete data['id']
      }

      console.debug('departments.submithandler')

      BUS.emit('subscriptions-sendsignedrequest', {
        url: BASEURL + '/departments',
        method: 'POST',
        payload: data,
        callback: function (d) {
          console.debug('add department', d)
          if (d.code == 0) {
            BUS.emit('gui', { op: 'notify', status: 'success', message: 'department saved successfully' })
            updatedata()
            BUS.emit('gui', { op: 'gotoscreen', screen: 'viewdepartments' })
          } else {
            BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem saving the department' })
          }
        }
      })
    }
  },
  addemployee: {
    title: 'New Employee',
    email: { type: 'email-input', label: 'Email Address' },
    fname: { type: 'input', label: 'First Name' },
    lname: { type: 'input', label: 'Family Name' },
    gender: { type: 'select', label: 'Gender', options: { f: 'Female', m: 'Male' } },
    workphone: { type: 'input', label: 'Work Phone' },
    join_date: { type: 'date', label: 'Join Month' },
    jobcode: { type: 'input', label: 'Job Title' },
    department_code: { type: 'select', label: 'Department', datasource: 'departmentsoptions' },
    reportmanager: { type: 'select', label: 'Report Manager', datasource: 'employeesoptions' },
    bsalary: { type: 'number', label: 'Basic Salary' },
    // vsalary: {type: 'input', label: 'Variable Salary'},
    isvisible: function () { return false },
    submit: { type: 'button', label: 'Add Employee' },
    submithandler: function (data) {
      var fields = FIELDS.employees
      var f

      // fill missing values
      for (f in fields) {
        if (f == 'id' || f == 'customfields') continue
        if (!data[fields[f]]) data[fields[f]] = 0
      }

      if (STATE.editedobjectid) {
        data.id = STATE.editedobjectid
        STATE.editedobjectid = undefined
      } else {
        delete data['id']
      }

      // collect custom fields
      var cfields = {}
      for (f in data) {
        if (f.indexOf('custom_') === 0) {
          cfields[f.substring(7)] = data[f]
          delete data[f]
        }
      }

      data['customfields'] = JSON.stringify(cfields)

      var addedid = data.id
      BUS.emit('subscriptions-sendsignedrequest', {
        url: BASEURL + '/employees',
        method: 'POST',
        payload: data,
        callback: function (d) {
          console.debug('add employees', d)
          if (d.code == 0) {
            BUS.emit('gui', { op: 'notify', status: 'success', message: 'employee saved successfully' })
            updatedata()

            if (!addedid) {
              BUS.emit('subscriptions-sendsignedrequest', {
                method: 'POST',
                url: 'https://subscriptions.codoma.tech/adduser',
                payload: { email: data.email, info: { service: 'hrms', table: 'employees', id: d.id } },
                callback: function (d) {
                  console.debug('subscriptions adduser', d)
                }
              })
            }

            BUS.emit('gui', { op: 'gotoscreen', screen: 'viewemployees' })
          } else {
            BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem adding the employee' })
          }
        }
      })
    }

  },
  terminateemployee: {
    title: 'Terminate Employee',
    name: { type: 'input', label: 'Employee Name' },
    terminationdate: { type: 'date', label: 'Termination Date' },
    terminationreason: { type: 'select', label: 'Reason', options: { resign: 'Resignation', notpassed: 'Probation not passed', terminate: 'Terminated' } },
    isvisible: function () { return false },
    submit: { type: 'button', label: 'Terminate Employee' },
    submithandler: function (data) {
      var obj

      if (!STATE.employeetoterminate) {
        // TODO error
        return
      }

      console.debug(data)

      if (!window.confirm(sprintf('Terminating an employee cannot be undone, are you sure you want to terminate %s?', name))) {
        BUS.emit('gui', { op: 'gotoscreen', screen: 'viewemployees' })
        return
      }

      obj = STATE.employeetoterminate
      STATE.employeetoterminate = undefined
      obj.employeestatus = 'TERMINATED:' + data.terminationdate + ':' + data.terminationreason

      BUS.emit('subscriptions-sendsignedrequest', {
        url: BASEURL + '/employees',
        method: 'POST',
        payload: obj,
        callback: function (d) {
          console.debug('terminate employee', d)
          if (d.code == 0) {
            BUS.emit('gui', { op: 'notify', status: 'success', message: 'employee terminated successfully' })

            BUS.emit('gui', { op: 'gotoscreen', screen: 'viewemployees' })
          } else {
            BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem terminating the employee' })
          }
        }
      })
    }

  },
  changesettings: {
    title: 'Change Settings',
    weight: 15,
    country: { type: 'select', label: 'Country', options: { eg: 'Egypt', ke: 'Kenya', ma: 'Morocco', sa: 'South Africa' } },
    weekenddays: { type: 'input', label: 'Weekend days', value: 'Fri, Sat' },
    nregularleaves: { type: 'number', label: 'Number of Regular Leaves', value: 24 },
    ncasualleaves: { type: 'number', label: 'Number of Casual Leaves', value: 6 },
    officialholidays: { type: 'textarea', label: 'Official Holidays (one date per line)' },
    masksalaries: { type: 'select', label: 'Show Emp. Salary to Supervisor', options: { 0: 'Yes', 1: 'No' } },
    submit: { type: 'button', label: 'Update Settings' },
    isvisible: function () { return STATE.account.subscriptionrole == 'principal' },
    submithandler: function (data) {
      data.weekenddays = data.weekenddays.split(/,\s*/)
      data.officialholidays = data.officialholidays.split(/\n/)

      // TODO validate

      var updatedcountry = data.country
      data = { values: JSON.stringify(data) }
      data['id'] = 32 // single record
      BUS.emit('subscriptions-sendsignedrequest', {
        url: BASEURL + '/settings',
        method: 'POST',
        payload: data,
        callback: function (d) {
          console.debug('changing settings', d)
          delete d.screen
          if (d.code == 0) {
            BUS.emit('gui', { op: 'notify', status: 'success', message: 'settings updated successfully' })
            var country = localStorage.getItem('country')

            if (country != updatedcountry && SUPPORTEDCOUNTRIES.indexOf(updatedcountry) >= 0) {
              localStorage.setItem('country', updatedcountry)
              window.location.reload()
            }
          } else {
            BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem updating the settings' })
          }
        }
      })
    }
  },
  bonusdeductionmain: {
    title: 'Bonus/Deduction',
    weight: 6,
    isvisible: function () { return STATE.account.subscriptionrole == 'principal' },
    addbd: { type: 'button',
      label: 'Add Bonus/Deduction',
      onclick: function () {
        BUS.emit('gui', { op: 'gotoscreen', screen: 'addbonusdeduction' })
      } },
    addbulk: { type: 'button',
      label: 'Performance Based',
      onclick: function () {
        BUS.emit('gui', { op: 'notify', status: 'info', message: 'This function not configured yet for your account, please contact the support' })
      } }
    // addperiodic: {type: 'button', label: 'Periodic Bonuses', onclick: function() {
    // BUS.emit('gui', {op: 'notify', status: 'info', message: 'This function not configured yet for your account, please contact the support'} )
    // }},

  },
  addbonusdeduction: {
    title: 'Add Bonus/Deduction',
    type: { type: 'select', label: 'Type', options: { bonus: 'Bonus', deduction: 'Deduction' } },
    employee: { type: 'select', label: 'Employee', multiple: true, datasource: 'employeesoptions' },
    date: { type: 'date', label: 'Date' },
    amount: { type: 'number', label: 'Amount' },
    notice: { type: 'input', label: 'Notice' },
    submit: { type: 'button', label: 'Save' },
    submithandler: function (data) {
      var endpoint = data.type == 'bonus' ? '/bonuses' : '/deductions'

      var employees = clone(data.employee)

      if (employees.length == 0) {
        BUS.emit('gui', { op: 'notify', status: 'error', message: 'Please enter at least one employee' })
        return
      }

      for (var i in employees) {
        data.employee = employees[i]
        BUS.emit('subscriptions-sendsignedrequest', {
          url: BASEURL + endpoint,
          method: 'POST',
          payload: data,
          callback: function (d) {
            if (d.code == 0) {
              BUS.emit('gui', { op: 'notify', status: 'success', message: data.type + ' saved successfully' })
              BUS.emit('gui', { op: 'gotoscreen' })
            } else {
              BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem submitting the ' + data.type })
            }
          }
        })
      }
    }
  },
  reports: {
    title: 'Reports',
    weight: 8,
    isvisible: function () { return STATE.account.subscriptionrole == 'principal' },
    payrollbutton: { type: 'button',
      label: 'Payroll',
      onclick: function () {
        BUS.emit('gui', { op: 'gotoscreen', screen: 'viewpayroll' })
      } }

  },
  addleaverequest: {
    title: 'New Leave Request',
    type: { type: 'select', label: 'Leave Type', options: { r: 'Regular', c: 'Casual', s: 'Sick' } },
    fromdate: { type: 'date', label: 'From' },
    todate: { type: 'date', label: 'To' },
    notice: { type: 'input', label: 'Notice' },
    submit: { type: 'button', label: 'Send Request' },
    isvisible: function () { return false/*! !STATE.account.password && STATE.account.subscriptionrole != 'principal' */ },
    submithandler: function (data) {
      var fields = FIELDS.leaverequests

      console.debug('adding leave request', data)

      // // fill missing values
      // for (var f in fields) {
      // if (f == 'id') continue
      // if (!data[fields[f]]) data[fields[f]] = 0
      // }

      data['employee'] = STATE.account.email
      data['date'] = moment().format('YYYY-MM-DD')

      data['status'] = ''

      var settings = getsettings(32)
      if (!settings) {
        BUS.emit('gui', { op: 'notify', status: 'error', message: 'Leave settings are not set, please ask the HR manager to update them' })
        return
      }

      if (!settings.officialholidays) {
        BUS.emit('gui', { op: 'notify', status: 'error', message: 'Please update the settings for official holidays' })
        return
      }

      if (!settings.weekenddays) {
        BUS.emit('gui', { op: 'notify', status: 'error', message: 'Please update the settings for weekend days' })
        return
      }

      // find number of used leaves

      var leavesstatus = employeeleavesstatus(data.employee, data.type)

      var nrequested = workingdaysbetweendates(data.fromdate, data.todate, settings.officialholidays, settings.weekenddays)

      console.debug('leaves status: ', leavesstatus)

      if (nrequested > leavesstatus.nremaining) {
        BUS.emit('gui', { op: 'notify', status: 'error', message: sprintf('You ask for %d days leave, but you have only %d remaining', nrequested, leavesstatus.nremaining) })
        return
      }

      console.debug('leaverequests.submithandler')

      BUS.emit('subscriptions-sendsignedrequest', {
        url: BASEURL + '/leaverequests',
        method: 'POST',
        payload: data,
        callback: function (d) {
          console.debug('add leaverequest', d)
          if (d.code == 0) {
            BUS.emit('gui', { op: 'notify', status: 'success', message: 'leave request submitted successfully' })
            BUS.emit('gui', { op: 'gotoscreen', screen: 'viewleaverequests' })
          } else {
            BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem submitting the leave request' })
          }
        }
      })
    }
  },

  addappraisal: {
    title: 'New Appraisal',
    weight: 8,
    employee: { type: 'select', label: 'Employees', multiple: true, datasource: 'employeesoptions' },
    from: { type: 'date', label: 'From' },
    to: { type: 'date', label: 'To' },
    description: { type: 'input', label: 'Description' },
    submit: { type: 'button', label: 'Start Appraisal' },
    isvisible: function () { return false },
    submithandler: function (data) {
      // TODO validate

      var settings = getsettings(32) || {}

      var m = settings.metrics || ['Quality', 'Efficiency', 'Behaviour']

      data['daterange'] = data.from + ' ' + data.to
      data['data'] = JSON.stringify({
        metrics: m
      })

      var employees = clone(data.employee)

      if (employees.length == 0) {
        BUS.emit('gui', { op: 'notify', status: 'error', message: 'Please enter at least one employee' })
        return
      }

      for (var i in employees) {
        data.employee = employees[i]
        BUS.emit('subscriptions-sendsignedrequest', {
          url: BASEURL + '/appraisals',
          method: 'POST',
          payload: data,
          callback: function (d) {
            if (d.code == 0) {
              BUS.emit('gui', { op: 'notify', status: 'success', message: 'appraisal added successfully' })
            } else {
              BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem adding the appraisal' })
            }
          }
        })
      }
    }
  },
  giveappraisal: {
    title: 'Evaluate Employee',
    id: { type: 'hidden' },
    employee: { type: 'input', label: 'Employee', readonly: true },
    daterange: { type: 'input', label: 'Date Range', readonly: true },
    description: { type: 'input', label: 'Description', readonly: true },
    quality: { type: 'select', label: 'Quality of Work', options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
    efficiency: { type: 'select', label: 'Work Efficiency/Productivity', options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
    behaviour: { type: 'select', label: 'Behaviour (discipline, attitude, etc)', options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
    submit: { type: 'button', label: 'Save Evaluation' },
    isvisible: function () { return false }, // to be accessed from rows
    submithandler: function (data) {
      // TODO validate

      var appraisal = CACHE.appraisals.filter(function (r) { return r[0] == data.id })[0]

      if (!appraisal) {
        BUS.emit('gui', { op: 'notify', status: 'error', message: 'cannot find the appraisal' })
        return
      }
      appraisal = makeobject(FIELDS.appraisals, appraisal)
      var d = JSON.parse(appraisal.data)
      if (!d.evaluations) d.evaluations = {}

      d.evaluations[STATE.account.email] = {
        quality: data.quality,
        efficiency: data.efficiency,
        behaviour: data.behaviour
      }

      appraisal.data = JSON.stringify(d)

      BUS.emit('subscriptions-sendsignedrequest', {
        url: BASEURL + '/appraisals',
        method: 'POST',
        payload: appraisal,
        callback: function (d) {
          if (d.code == 0) {
            BUS.emit('gui', { op: 'notify', status: 'success', message: 'evaluation saved successfully' })
            updatedata()
          } else {
            BUS.emit('gui', { op: 'notify', status: 'error', message: 'problem saving the evaluation' })
          }
        }
      })
    }
  }

} // screens
