//define table
TabularTables = {};

TabularTables.Hikers = new Tabular.Table({
  name: 'Hikers',
  collection: Hikers,
  columns: [
    { data: 'first_name', title: 'First Name' },
    { data: 'last_name', title: 'Last Name' },
    { data: 'trail_name', title: 'Trail Name' },
    { data: 'date', title: 'Estimated Date' },
    { data: 'regNum', title: 'Registration Number' },
    { data: 'timestamp', title: 'Timestamp' },
    { data: 'delete', title: '', fn: function () { return new Spacebars.SafeString('<button type="button" class="deletebtn">Delete</button>') } }
  ],
  dom: 'B',
  buttons: ['print']
});