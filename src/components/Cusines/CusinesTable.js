import React, { useEffect, useState } from "react";
import Dispatcher from "../../Dispatcher/Dispatcher";
import Config from "../../Dispatcher/Config.json";
import MaterialTable from "material-table";
import Select from "react-select";

function CusinesTable() {
  const tableRef = React.createRef();
  const [FilterData, setFilterData] = useState({
    listofregion: {},
    listofstate: {},
    listofingredients: {},
    listofingredientArray: [],
  });
  useEffect(() => {
    Dispatcher.call({
      url: Config.endpoint.listofregion,
    }).then((data) => {
      let State = Array.from(new Set(data.data.map((e) => e.State)));
      let region = Array.from(new Set(data.data.map((e) => e.Region)));
      let StateObject = {};
      let RegionObject = {};
      State.forEach((elem, i) => {
        StateObject[elem] = elem;
      });
      region.forEach((elem, i) => {
        RegionObject[elem] = elem;
      });
      Dispatcher.call({
        url: Config.endpoint.listofingredients,
      }).then((data) => {
        let IngredientsObject = {};
        data.data.forEach((elem, i) => {
          IngredientsObject[elem] = elem;
        });
        setFilterData({
          listofregion: RegionObject,
          listofstate: StateObject,
          listofingredients: IngredientsObject,
          listofingredientArray: data.data,
        });
      });
    });
  }, []);
  console.log(FilterData);

  return (
    <>
      Cusine
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      ></link>
      {}
      <MaterialTable
        title="List Of Cusines"
        tableRef={tableRef}
        columns={[
          { title: "Cusine Name", field: "Name" },
          {
            title: "Diet",
            field: "Diet",
            lookup: {
              vegetarian: "vegetarian",
              "non vegetarian": "non vegetarian",
            },
          },
          {
            title: "Course",
            field: "Course",
            lookup: {
              dessert: "dessert",
              "main course": "main course",
              starter: "starter",
              snack: "snack",
            },
          },
          {
            title: "Flavor Profile",
            field: "Flavor_Profile",
            lookup: { spicy: "spicy", sweet: "sweet", bitter: "bitter" },
          },
          {
            title: "Ingredients",
            field: "Ingredients",

            lookup: FilterData.listofingredients,
            editPlaceholder: "List the Ingredient saperated with comma(`,`)",
            editComponent: (props) => (
              <input
                type="text"
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
              />
            ),
            render: (rowData) => {
              return rowData.Ingredients.toString();
            },
          },
          {
            title: "Prepration Time",
            field: "Pre_Time",
            filtering: false,
          },

          {
            title: "Cooking Time",
            field: "Cooking_Time",
            filtering: false,
          },
          {
            title: "Region",
            field: "Region",
            lookup: FilterData.listofregion,
          },
          {
            title: "State",
            field: "State",
            lookup: FilterData.listofstate,
          },
        ]}
        options={{
          actionsColumnIndex: -1,
          exportAllData: true,
          search: false,
          filtering: true,
          exportButton: true,
          columnResizable: true,
          sorting: false,
          paging: true,
          pageSize: 5, // make initial page size
          emptyRowsWhenPaging: false, //to make page size fix in case of less data rows
          pageSizeOptions: [10, 15, 20, 25],
          headerStyle: {
            fontWeight: "bold",
            fontSize: 15,
          }, // rows selection options
          cellStyle: {
            fontSize: "14px",
          },
        }}
        data={(query) =>
          new Promise((resolve, reject) => {
            let filters = query.filters.map((e) => {
              return {
                column: {
                  title: e.column.title,
                  field: e.column.field,
                  tableData: e.column.tableData,
                },
              };
            });
            let url = "http://localhost:3011/api/cusines?";
            url += "pageSize=" + query.pageSize;
            url += "&page=" + (query.page + 1);
            url +=
              filters.length > 0
                ? "&filter=" +
                  JSON.stringify({ filter: filters.map((e) => e.column) })
                : "";

            fetch(url, {
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded;charset=utf-8",
              },
            })
              .then((response) => response.json())
              .then((result) => {
                setTimeout(() => {
                  resolve({
                    data: result.data.data,
                    page: result.data.page,
                    totalCount: result.data.totalCount,
                  });
                }, 100);
              });
          })
        }
        editable={{
          onRowAdd: (newData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                newData.Ingredients = newData.Ingredients.split(",");
                /* setData([...data, newData]); */
                Dispatcher.call({
                  url: Config.endpoint.cusines,
                  method: "post",
                  data: newData,
                }).then((data) => {
                  tableRef.current && tableRef.current.onQueryChange();
                  resolve();
                });
              }, 1000);
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              newData.Ingredients = newData.Ingredients.split(",");
              Dispatcher.call({
                url: Config.endpoint.cusines,
                method: "patch",
                data: newData,
              }).then((data) => {
                setTimeout(() => {
                  tableRef.current && tableRef.current.onQueryChange();
                  resolve();
                }, 1000);
              });
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
              console.log(oldData);
              Dispatcher.call({
                url: Config.endpoint.cusines,
                method: "delete",
                data: oldData,
              }).then((data) => {
                setTimeout(() => {
                  tableRef.current && tableRef.current.onQueryChange();
                  resolve();
                }, 1000);
              });
            }),
        }}
      />
    </>
  );
}

export default CusinesTable;
